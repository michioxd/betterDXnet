import { GameRecordSyncStatus, type JudgeCount } from "@/api/records/types";
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
import { useEffect, useMemo, useState } from "react";
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

type NoteKey = (typeof noteRows)[number]["key"];

type LostPercentageData = {
    judgments: Partial<Record<NoteKey, Partial<Record<keyof JudgeCount, string>>>>;
    noteTotals: Partial<Record<NoteKey, string>>;
};

const noteScoreFactor: Record<NoteKey, number> = {
    tap: 1,
    hold: 2,
    slide: 3,
    touch: 1,
    break: 5,
};

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

function formatPercent(value: number) {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

function formatLossPercent(value: number) {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}%`;
}

function getJudgeSum(judgeCount: JudgeCount) {
    return judgeLabels.reduce((total, judge) => total + judgeCount[judge.key], 0);
}

function calculateLostPercentages(detailJudge: Record<NoteKey, JudgeCount>, achievement: number): LostPercentageData {
    const total = noteRows.reduce(
        (sum, note) => sum + getJudgeSum(detailJudge[note.key]) * noteScoreFactor[note.key],
        0,
    );
    if (total === 0) return { judgments: {}, noteTotals: {} };

    const base = 100 / total;
    const losses: Partial<Record<NoteKey, Partial<Record<keyof JudgeCount, number>>>> = {};

    for (const note of noteRows.slice(0, 4)) {
        const factor = noteScoreFactor[note.key];
        losses[note.key] = {
            great: (factor * detailJudge[note.key].great * base) / 5,
            good: (factor * detailJudge[note.key].good * base) / 2,
            miss: factor * detailJudge[note.key].miss * base,
        };
    }

    const breakJudge = detailJudge.break;
    const numBreaks = getJudgeSum(breakJudge);
    losses.break = {};

    if (numBreaks > 0) {
        losses.break.good = breakJudge.good * (3 * base + 0.7 / numBreaks);
        losses.break.miss = breakJudge.miss * (5 * base + 1 / numBreaks);

        const fixedLoss = noteRows.reduce(
            (sum, note) => sum + Object.values(losses[note.key] ?? {}).reduce((noteSum, loss) => noteSum + loss, 0),
            0,
        );
        const remainingBreakPerfectGreatLoss = 101 - fixedLoss - achievement;

        if (breakJudge.perfect > 0 || breakJudge.great > 0) {
            let closest: number | null = null;
            let closestBreak: [number, number, number, number, number] | null = null;
            let nextClosest: number | null = null;
            let nextPerfect: number | null = null;

            for (let gp = 0; gp <= breakJudge.perfect; gp += 1) {
                for (let gg = 0; gg <= breakJudge.great; gg += 1) {
                    for (let mg = 0; mg <= breakJudge.great - gg; mg += 1) {
                        const bp = breakJudge.perfect - gp;
                        const bg = breakJudge.great - gg - mg;
                        const breakLoss =
                            (gp / 4 + bp / 2) / numBreaks +
                            ((5 * base) / 5 + 0.6 / numBreaks) * gg +
                            (5 * base * 0.4 + 0.6 / numBreaks) * mg +
                            ((5 * base) / 2 + 0.6 / numBreaks) * bg;
                        const distance = Math.abs(breakLoss - remainingBreakPerfectGreatLoss);

                        if (closest === null || distance < closest) {
                            if (closest !== null && closestBreak?.[0] !== gp) {
                                nextPerfect = closest;
                            }
                            nextClosest = closest;
                            closest = distance;
                            closestBreak = [gp, bp, gg, mg, bg];
                        } else {
                            if (nextClosest === null || distance < nextClosest) {
                                nextClosest = distance;
                            }
                            if (closestBreak?.[0] !== gp && (nextPerfect === null || distance < nextPerfect)) {
                                nextPerfect = distance;
                            }
                        }
                    }
                }
            }

            if (closestBreak && (nextPerfect === null || nextPerfect > 0.00015)) {
                const [gp, bp] = closestBreak;
                const perfectLoss = (gp / 4 + bp / 2) / numBreaks;
                if (breakJudge.perfect > 0) losses.break.perfect = perfectLoss;
                if (breakJudge.great > 0) losses.break.great = remainingBreakPerfectGreatLoss - perfectLoss;
            } else {
                const minPerfectLoss = (0.25 / numBreaks) * breakJudge.perfect;
                const maxPerfectLoss = (0.5 / numBreaks) * breakJudge.perfect;
                const minGreatLoss = ((5 * base) / 5 + 0.6 / numBreaks) * breakJudge.great;
                const maxGreatLoss = ((5 * base) / 2 + 0.6 / numBreaks) * breakJudge.great;

                const formattedLosses = formatLostPercentages(losses, {
                    break:
                        Object.values(losses.break ?? {}).reduce((sum, loss) => sum + loss, 0) +
                        remainingBreakPerfectGreatLoss,
                });

                if (breakJudge.perfect > 0) {
                    const min = -Math.max(minPerfectLoss, remainingBreakPerfectGreatLoss - maxGreatLoss);
                    const max = -Math.min(maxPerfectLoss, remainingBreakPerfectGreatLoss - minGreatLoss);
                    formattedLosses.judgments.break = {
                        ...formattedLosses.judgments.break,
                        perfect:
                            Math.abs(max - min) < 0.0001
                                ? formatLossPercent(min)
                                : `${formatLossPercent(min)}~${formatLossPercent(max)}`,
                    };
                }

                if (breakJudge.great > 0) {
                    const min = -Math.max(minGreatLoss, remainingBreakPerfectGreatLoss - maxPerfectLoss);
                    const max = -Math.min(maxGreatLoss, remainingBreakPerfectGreatLoss - minPerfectLoss);
                    formattedLosses.judgments.break = {
                        ...formattedLosses.judgments.break,
                        great:
                            Math.abs(max - min) < 0.0001
                                ? formatLossPercent(min)
                                : `${formatLossPercent(min)}~${formatLossPercent(max)}`,
                    };
                }

                return formattedLosses;
            }
        }
    }

    return formatLostPercentages(losses);
}

function formatLostPercentages(
    losses: Partial<Record<NoteKey, Partial<Record<keyof JudgeCount, number>>>>,
    noteTotalOverrides: Partial<Record<NoteKey, number>> = {},
): LostPercentageData {
    const judgments = Object.fromEntries(
        Object.entries(losses).map(([noteKey, noteLosses]) => [
            noteKey,
            Object.fromEntries(
                Object.entries(noteLosses ?? {})
                    .filter(([, loss]) => loss > 0)
                    .map(([judgeKey, loss]) => [judgeKey, formatLossPercent(-loss)]),
            ),
        ]),
    ) as Partial<Record<NoteKey, Partial<Record<keyof JudgeCount, string>>>>;
    const noteTotals = Object.fromEntries(
        noteRows
            .map((note) => {
                const loss =
                    noteTotalOverrides[note.key] ??
                    Object.values(losses[note.key] ?? {}).reduce((sum, noteLoss) => sum + noteLoss, 0);

                return [note.key, loss > 0 ? formatLossPercent(-loss) : undefined];
            })
            .filter(([, loss]) => loss),
    ) as Partial<Record<NoteKey, string>>;

    return { judgments, noteTotals };
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
    const [showLostPercentage, setShowLostPercentage] = useState(() => localStorage.getItem("bdn.lostp") === "1");
    const lostPercentageData = useMemo<LostPercentageData>(
        () =>
            detail
                ? calculateLostPercentages(detail.judge, detail.detail.achievement)
                : { judgments: {}, noteTotals: {} },
        [detail],
    );
    const accuracyLossData = useMemo(
        () => (detail ? calculateAccuracyLossByNoteType(detail.judge, detail.detail.achievement) : []),
        [detail],
    );
    const totalAccuracyLoss = useMemo(
        () => accuracyLossData.reduce((sum, item) => sum + item.loss, 0),
        [accuracyLossData],
    );

    const toggleLostPercentage = () => {
        setShowLostPercentage((current) => {
            const next = !current;
            localStorage.setItem("bdn.lostp", next ? "1" : "0");
            return next;
        });
    };

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
                        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
                            <RecordCard
                                record={detail.detail}
                                sessionColor={colorFromSessionStart(detail.detail.playDate)}
                                to={`/records/game/${id}`}
                            />
                        </Box>
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
                                        {detail.detail.syncStatus !== GameRecordSyncStatus.SOLO && (
                                            <Chip
                                                size="small"
                                                color="secondary"
                                                label={t("detail.chips.maxSync", {
                                                    current: detail.maxSync.current.toLocaleString(),
                                                    max: detail.maxSync.max.toLocaleString(),
                                                })}
                                            />
                                        )}
                                        <Chip
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            label={t("detail.chips.accuracyLoss", {
                                                value: formatPercent(totalAccuracyLoss),
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
                                                            <Box component="span" sx={{ display: "block" }}>
                                                                {note.label}
                                                            </Box>
                                                            {showLostPercentage &&
                                                                lostPercentageData.noteTotals?.[note.key] && (
                                                                    <Typography
                                                                        component="span"
                                                                        variant="caption"
                                                                        sx={{
                                                                            color: "text.secondary",
                                                                            display: "block",
                                                                            lineHeight: 1.2,
                                                                            mt: 0.25,
                                                                        }}
                                                                    >
                                                                        ({lostPercentageData.noteTotals[note.key]})
                                                                    </Typography>
                                                                )}
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
                                                                <Box component="span" sx={{ display: "block" }}>
                                                                    {detail.judge[note.key][judge.key].toLocaleString()}
                                                                </Box>
                                                                {showLostPercentage &&
                                                                    lostPercentageData.judgments?.[note.key]?.[
                                                                        judge.key
                                                                    ] && (
                                                                        <Typography
                                                                            component="span"
                                                                            variant="caption"
                                                                            sx={{
                                                                                color: "text.secondary",
                                                                                display: "block",
                                                                                lineHeight: 1.2,
                                                                                mt: 0.25,
                                                                            }}
                                                                        >
                                                                            (
                                                                            {
                                                                                lostPercentageData.judgments[
                                                                                    note.key
                                                                                ]?.[judge.key]
                                                                            }
                                                                            )
                                                                        </Typography>
                                                                    )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        color="error"
                                        onClick={toggleLostPercentage}
                                    >
                                        {showLostPercentage
                                            ? t("detail.actions.hideLostPercentage")
                                            : t("detail.actions.showLostPercentage")}
                                    </Button>
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
                                    <AccuracyLossChart data={accuracyLossData} />
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
