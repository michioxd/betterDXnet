import ProfileCard from "@/components/ProfileCard";
import type { GameRecordPlayLogDetail, JudgeCount, JudgeTable } from "@/api/records/types";
import { AccuracyLossChart, calculateAccuracyLossByNoteType } from "@/components/AccuracyLossChart";
import { AccuracyByNoteTypeBarChart } from "@/components/AccuracyRadarChart";
import type { AccuracyData, AccuracyNoteType } from "@/components/AccuracyRadarChart";
import { JudgeDistributionChart, OverallJudgmentDistributionChart } from "@/components/JudgeDistributionCharts";
import { TimingBias } from "@/components/TimingBias";
import { rootStore } from "@/stores/root";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    LinearProgress,
    Link,
    Stack,
    Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link as LinkRouter } from "react-router-dom";
import RedeemIcon from "@mui/icons-material/Redeem";

import { colorFromSessionStart, RecordCard } from "./records/Last50";

const SUMMARY_REQUEST_DELAY_MS = 500;

const judgeKeys: Array<keyof JudgeCount> = ["criticalPerfect", "perfect", "great", "good", "miss"];
const noteRows = [
    { key: "tap", label: "Tap" },
    { key: "hold", label: "Hold" },
    { key: "slide", label: "Slide" },
    { key: "touch", label: "Touch" },
    { key: "break", label: "Break" },
] as const;

const emptyJudgeCount: JudgeCount = {
    criticalPerfect: 0,
    perfect: 0,
    great: 0,
    good: 0,
    miss: 0,
};

const judgeAccuracyWeight: Record<keyof JudgeCount, number> = {
    criticalPerfect: 1,
    perfect: 1,
    great: 0.8,
    good: 0.5,
    miss: 0,
};

function createEmptyJudgeTable(): JudgeTable {
    return {
        tap: { ...emptyJudgeCount },
        hold: { ...emptyJudgeCount },
        slide: { ...emptyJudgeCount },
        touch: { ...emptyJudgeCount },
        break: { ...emptyJudgeCount },
    };
}

function aggregateJudgeTable(details: GameRecordPlayLogDetail[]) {
    const aggregate = createEmptyJudgeTable();

    details.forEach((detail) => {
        noteRows.forEach((note) => {
            judgeKeys.forEach((judge) => {
                aggregate[note.key][judge] += detail.judge[note.key][judge];
            });
        });
    });

    return aggregate;
}

function getJudgeSum(judgeCount: JudgeCount) {
    return judgeKeys.reduce((sum, judge) => sum + judgeCount[judge], 0);
}

function getNoteAccuracy(judgeCount: JudgeCount) {
    const total = getJudgeSum(judgeCount);
    if (total === 0) return 0;

    const weightedTotal = judgeKeys.reduce((sum, judge) => sum + judgeCount[judge] * judgeAccuracyWeight[judge], 0);

    return (weightedTotal / total) * 100;
}

function buildAccuracyData(judgeTable: JudgeTable): AccuracyData[] {
    return noteRows.map((note) => ({
        noteType: note.label as AccuracyNoteType,
        accuracy: getNoteAccuracy(judgeTable[note.key]),
        totalNotes: getJudgeSum(judgeTable[note.key]),
    }));
}

function buildAccuracyLossData(details: GameRecordPlayLogDetail[]) {
    const lossesByNoteType = new Map<AccuracyNoteType, number>();

    details.forEach((detail) => {
        calculateAccuracyLossByNoteType(detail.judge, detail.detail.achievement).forEach((item) => {
            lossesByNoteType.set(item.noteType, (lossesByNoteType.get(item.noteType) ?? 0) + item.loss);
        });
    });

    const totalLoss = [...lossesByNoteType.values()].reduce((sum, loss) => sum + loss, 0);

    return noteRows
        .map((note) => {
            const noteType = note.label as AccuracyNoteType;
            const loss = lossesByNoteType.get(noteType) ?? 0;

            return {
                noteType,
                loss,
                totalLossPercentage: totalLoss === 0 ? 0 : (loss / totalLoss) * 100,
            };
        })
        .sort((left, right) => right.loss - left.loss);
}

function delay(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function PageHome() {
    const { t } = useTranslation("pages");
    const { me, records } = rootStore;
    const [summaryRequested, setSummaryRequested] = useState(false);
    const [summaryGenerating, setSummaryGenerating] = useState(false);

    useEffect(() => {
        void records.ensureLast50();
    }, [records]);

    const recentRecords = useMemo(
        () => [...records.last50].sort((left, right) => right.playDate.getTime() - left.playDate.getTime()).slice(0, 4),
        [records.last50],
    );
    const last50Details = useMemo(
        () => records.last50.map((record) => records.getPlayLogDetail(record.id)).filter((detail) => detail),
        [records, records.last50, records.playLogDetails],
    );
    const summaryJudgeTable = useMemo(() => aggregateJudgeTable(last50Details), [last50Details]);
    const summaryAccuracyData = useMemo(() => buildAccuracyData(summaryJudgeTable), [summaryJudgeTable]);
    const summaryAccuracyLossData = useMemo(() => buildAccuracyLossData(last50Details), [last50Details]);
    const summaryFastLate = useMemo(
        () =>
            last50Details.reduce(
                (total, detail) => ({
                    fast: total.fast + detail.fast,
                    late: total.late + detail.late,
                }),
                { fast: 0, late: 0 },
            ),
        [last50Details],
    );
    const summaryErrors = records.last50
        .map((record) => records.getPlayLogDetailError(record.id))
        .filter((error): error is Error => error !== null);
    const summaryProgressTotal = records.last50.length;
    const summaryProgressDone = last50Details.length + summaryErrors.length;
    const summaryProgressValue = summaryProgressTotal === 0 ? 0 : (summaryProgressDone / summaryProgressTotal) * 100;
    const summaryLoading =
        summaryGenerating || records.last50.some((record) => records.isPlayLogDetailLoading(record.id));
    const loadSummary = useCallback(
        async (forceRefresh = false) => {
            setSummaryRequested(true);
            setSummaryGenerating(true);

            try {
                const last50Snapshot = [...records.last50];

                if (forceRefresh) {
                    records.clearPlayLogDetails(last50Snapshot.map((record) => record.id));
                }

                for (const [index, record] of last50Snapshot.entries()) {
                    if (!records.getPlayLogDetail(record.id)) {
                        await records.ensurePlayLogDetail(record.id);
                    }

                    if (index < last50Snapshot.length - 1) {
                        await delay(SUMMARY_REQUEST_DELAY_MS);
                    }
                }
            } finally {
                setSummaryGenerating(false);
            }
        },
        [records, records.last50],
    );

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            <Box>
                <Typography variant="h5">{t("home.welcome", { version: import.meta.env.VITE_APP_VERSION })}</Typography>
                <Typography color="textSecondary">
                    {t("home.loggedInAs")}{" "}
                    <Typography component="span" sx={{ fontWeight: "bold" }}>
                        {me.me?.name}
                    </Typography>
                </Typography>
            </Box>

            <Alert severity="info">
                <AlertTitle>Hi there!</AlertTitle>
                Thanks for using betterDXnet! This is an early version of the extension, and there may be bugs or
                missing features. If you encounter any issues, please report them on our{" "}
                <Link
                    color="inherit"
                    href="https://github.com/michioxd/betterDXnet/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub Issues
                </Link>
                . Since this extension is fully open source on{" "}
                <Link
                    color="inherit"
                    href="https://github.com/michioxd/betterDXnet"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </Link>
                , feel free to contribute or suggest improvements! Have fun!
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <Button
                        color="inherit"
                        component={Link}
                        href="https://buymeacoffee.com/michioxd"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ ml: 1 }}
                        variant="outlined"
                        startIcon={<RedeemIcon />}
                    >
                        Buy me a coffee
                    </Button>
                </Box>
            </Alert>

            {me?.me && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <Box sx={{ maxWidth: 500, width: "100%" }}>
                        <ProfileCard d={me?.me} />
                    </Box>
                </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center", mt: 1 }}>
                <Box>
                    <Typography variant="h6">{t("home.recentRecords")}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {t("home.recentRecordsDescription")}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => void records.refreshLast50()}
                        loading={records.last50Loading}
                        disabled={records.last50Loading}
                    >
                        {t("home.reload")}
                    </Button>
                    <Button component={LinkRouter} to="/records/game" variant="outlined">
                        {t("home.seeAll")}
                    </Button>
                </Box>
            </Box>

            {records.last50Loading && recentRecords.length === 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {records.last50Error && <Typography color="error">{records.last50Error.message}</Typography>}

            {recentRecords.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    {recentRecords.map((record, index) => (
                        <Box key={`${record.id}-${index}`} sx={{ width: { xs: "100%", md: "calc(50% - 8px)" } }}>
                            <RecordCard record={record} sessionColor={colorFromSessionStart(record.playDate)} />
                        </Box>
                    ))}
                </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center", mt: 1 }}>
                <Box>
                    <Typography variant="h6">{t("home.summary.title")}</Typography>
                    <Typography variant="body2" color="textSecondary">
                        {t("home.summary.description")}
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    onClick={() => void loadSummary(last50Details.length > 0)}
                    loading={summaryLoading}
                    disabled={records.last50Loading || summaryLoading || summaryProgressTotal === 0}
                >
                    {last50Details.length > 0 ? t("home.summary.reload") : t("home.summary.generate")}
                </Button>
            </Box>

            {summaryRequested && (
                <Box sx={{ display: "grid", gap: 0.75 }}>
                    <LinearProgress variant="determinate" value={summaryProgressValue} />
                    <Typography color="textSecondary" variant="body2">
                        {t("home.summary.progress", {
                            loaded: last50Details.length.toLocaleString(),
                            total: summaryProgressTotal.toLocaleString(),
                        })}
                        {summaryErrors.length > 0
                            ? t("home.summary.progressFailed", { failed: summaryErrors.length.toLocaleString() })
                            : ""}
                    </Typography>
                </Box>
            )}

            {summaryRequested && summaryErrors.length > 0 && (
                <Alert severity="warning">
                    {t("home.summary.loadError", { count: summaryErrors.length.toLocaleString() })}
                </Alert>
            )}

            {last50Details.length > 0 && (
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <TimingBias fast={summaryFastLate.fast} late={summaryFastLate.late} />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="h6">
                                            {t("home.summary.accuracyLossByNoteType.title")}
                                        </Typography>
                                        <Typography color="textSecondary" variant="body2">
                                            {t("home.summary.accuracyLossByNoteType.description")}
                                        </Typography>
                                    </Box>
                                    <AccuracyLossChart data={summaryAccuracyLossData} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="h6">
                                            {t("home.summary.accuracyByNoteType.title")}
                                        </Typography>
                                        <Typography color="textSecondary" variant="body2">
                                            {t("home.summary.accuracyByNoteType.description")}
                                        </Typography>
                                    </Box>
                                    <AccuracyByNoteTypeBarChart data={summaryAccuracyData} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 6 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="h6">
                                            {t("home.summary.overallJudgmentDistribution.title")}
                                        </Typography>
                                        <Typography color="textSecondary" variant="body2">
                                            {t("home.summary.overallJudgmentDistribution.description")}
                                        </Typography>
                                    </Box>
                                    <OverallJudgmentDistributionChart data={summaryJudgeTable} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="h6">
                                            {t("home.summary.judgeDistribution.title")}
                                        </Typography>
                                        <Typography color="textSecondary" variant="body2">
                                            {t("home.summary.judgeDistribution.description")}
                                        </Typography>
                                    </Box>
                                    <JudgeDistributionChart data={summaryJudgeTable} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

export default observer(PageHome);
