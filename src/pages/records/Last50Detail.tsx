import type { JudgeCount } from "@/api/records/types";
import { AccuracyLossChart, calculateAccuracyLossByNoteType } from "@/components/AccuracyLossChart";
import { AccuracyRadarChart } from "@/components/AccuracyRadarChart";
import type { AccuracyData, AccuracyNoteType } from "@/components/AccuracyRadarChart";
import {
    getJudgeColor,
    JudgeDistributionChart,
    OverallJudgmentDistributionChart,
} from "@/components/JudgeDistributionCharts";
import { TimingBias } from "@/components/TimingBias";
import { rootStore } from "@/stores/root";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { colorFromSessionStart, RecordCard } from "./Last50";

const judgeLabels: Array<{ key: keyof JudgeCount; label: string }> = [
    { key: "criticalPerfect", label: "Critical Perfect" },
    { key: "perfect", label: "Perfect" },
    { key: "great", label: "Great" },
    { key: "good", label: "Good" },
    { key: "miss", label: "Miss" },
];

const noteRows = [
    { key: "tap", label: "Tap" },
    { key: "hold", label: "Hold" },
    { key: "slide", label: "Slide" },
    { key: "touch", label: "Touch" },
    { key: "break", label: "Break" },
] as const;

const judgeAccuracyWeight: Record<keyof JudgeCount, number> = {
    criticalPerfect: 1,
    perfect: 1,
    great: 0.8,
    good: 0.5,
    miss: 0,
};

function getNoteAccuracy(judgeCount: JudgeCount) {
    const total = judgeLabels.reduce((sum, judge) => sum + judgeCount[judge.key], 0);
    if (total === 0) return 0;

    const weightedTotal = judgeLabels.reduce(
        (sum, judge) => sum + judgeCount[judge.key] * judgeAccuracyWeight[judge.key],
        0,
    );

    return (weightedTotal / total) * 100;
}

function getTotalNotes(detailJudge: Record<(typeof noteRows)[number]["key"], JudgeCount>) {
    return noteRows.reduce(
        (noteTotal, note) =>
            noteTotal + judgeLabels.reduce((total, judge) => total + detailJudge[note.key][judge.key], 0),
        0,
    );
}

function getOverallAccuracy(detailJudge: Record<(typeof noteRows)[number]["key"], JudgeCount>) {
    const totalNotes = getTotalNotes(detailJudge);
    if (totalNotes === 0) return 100;

    const weightedTotal = noteRows.reduce(
        (noteTotal, note) =>
            noteTotal +
            judgeLabels.reduce(
                (total, judge) => total + detailJudge[note.key][judge.key] * judgeAccuracyWeight[judge.key],
                0,
            ),
        0,
    );

    return (weightedTotal / totalNotes) * 100;
}

function formatPercent(value: number) {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

function buildAccuracyData(detailJudge: Record<(typeof noteRows)[number]["key"], JudgeCount>): AccuracyData[] {
    return noteRows.map((note) => ({
        noteType: note.label as AccuracyNoteType,
        accuracy: getNoteAccuracy(detailJudge[note.key]),
        totalNotes: judgeLabels.reduce((total, judge) => total + detailJudge[note.key][judge.key], 0),
    }));
}

function PageRecordsLast50Detail() {
    const { t } = useTranslation("records");
    const { id } = useParams();
    const { app, records } = rootStore;
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const detail = id ? records.getPlayLogDetail(id) : undefined;
    const loading = id ? records.isPlayLogDetailLoading(id) : false;
    const error = id ? records.getPlayLogDetailError(id) : null;

    useEffect(() => {
        if (!id) return;

        void records.ensurePlayLogDetail(id);
    }, [id, records]);

    useEffect(() => {
        app.setGlobalLoading(loading);
    }, [app, loading]);

    if (!id) {
        return <Alert severity="error">{t("detail.recordIdNotFound")}</Alert>;
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                <Box>
                    <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton component={Link} to="/records/game" size="small" aria-label={t("detail.back")}>
                            <ArrowBackIosNewIcon />
                        </IconButton>
                        {t("detail.title")}
                    </Typography>
                    <Typography color="textSecondary">{t("detail.description")}</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => void records.refreshPlayLogDetail(id)}
                        loading={loading}
                        disabled={loading}
                    >
                        {t("detail.reload")}
                    </Button>
                </Stack>
            </Box>

            {loading && !detail && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error">{error.message}</Alert>}

            {detail && (
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <RecordCard
                            record={detail.detail}
                            sessionColor={colorFromSessionStart(detail.detail.playDate)}
                            to={`/records/game/${id}`}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, lg: 7 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                                        <Chip
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                            label={t("detail.chips.fast", { count: detail.fast.toLocaleString() })}
                                        />
                                        <Chip
                                            color="secondary"
                                            variant="outlined"
                                            size="small"
                                            label={t("detail.chips.late", { count: detail.late.toLocaleString() })}
                                        />
                                        <Chip
                                            color={
                                                detail.ratingDirection === "up"
                                                    ? "success"
                                                    : detail.ratingDirection === "down"
                                                      ? "error"
                                                      : "default"
                                            }
                                            size="small"
                                            label={t("detail.chips.rating", {
                                                rating: detail.ratingResult.toLocaleString(),
                                                delta: `${detail.ratingDelta > 0 ? "+" : ""}${detail.ratingDelta.toLocaleString()}`,
                                            })}
                                        />
                                        <Chip
                                            size="small"
                                            color="primary"
                                            label={t("detail.chips.maxCombo", {
                                                current: detail.maxCombo.current.toLocaleString(),
                                                max: detail.maxCombo.max.toLocaleString(),
                                            })}
                                        />
                                        <Chip
                                            size="small"
                                            color="secondary"
                                            label={t("detail.chips.maxSync", {
                                                current: detail.maxSync.current.toLocaleString(),
                                                max: detail.maxSync.max.toLocaleString(),
                                            })}
                                        />
                                        <Chip
                                            size="small"
                                            label={t("detail.chips.totalNotes", {
                                                count: getTotalNotes(detail.judge).toLocaleString(),
                                            })}
                                        />
                                        <Chip
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                            label={t("detail.chips.accuracyLoss", {
                                                value: formatPercent(100 - getOverallAccuracy(detail.judge)),
                                            })}
                                        />
                                    </Stack>

                                    <Box sx={{ overflowX: "auto" }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>{t("detail.labels.note")}</TableCell>
                                                    {judgeLabels.map((judge) => (
                                                        <TableCell
                                                            key={judge.key}
                                                            align="right"
                                                            sx={{
                                                                color: getJudgeColor(judge.key, isDarkMode),
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {t(`detail.judgments.${judge.key}`)}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {noteRows.map((note) => (
                                                    <TableRow key={note.key}>
                                                        <TableCell component="th" scope="row">
                                                            {note.label}
                                                        </TableCell>
                                                        {judgeLabels.map((judge) => (
                                                            <TableCell
                                                                key={judge.key}
                                                                align="right"
                                                                sx={{
                                                                    color: getJudgeColor(judge.key, isDarkMode),
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                {detail.judge[note.key][judge.key].toLocaleString()}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 3 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="h6">{t("detail.accuracyByNoteType.title")}</Typography>
                                        <Typography color="textSecondary" variant="body2">
                                            {t("detail.accuracyByNoteType.description")}
                                        </Typography>
                                    </Box>
                                    <AccuracyRadarChart data={buildAccuracyData(detail.judge)} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 9 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="h6">
                                            {t("detail.overallJudgmentDistribution.title")}
                                        </Typography>
                                        <Typography color="textSecondary" variant="body2">
                                            {t("detail.overallJudgmentDistribution.description")}
                                        </Typography>
                                    </Box>
                                    <OverallJudgmentDistributionChart data={detail.judge} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <TimingBias fast={detail.fast} late={detail.late} />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="h6">{t("detail.accuracyLossByNoteType.title")}</Typography>
                                        <Typography color="textSecondary" variant="body2">
                                            {t("detail.accuracyLossByNoteType.description")}
                                        </Typography>
                                    </Box>
                                    <AccuracyLossChart data={calculateAccuracyLossByNoteType(detail.judge)} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="h6">{t("detail.judgeDistribution.title")}</Typography>
                                        <Typography color="textSecondary" variant="body2">
                                            {t("detail.judgeDistribution.description")}
                                        </Typography>
                                    </Box>
                                    <JudgeDistributionChart data={detail.judge} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

export default observer(PageRecordsLast50Detail);
