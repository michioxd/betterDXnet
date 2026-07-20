import type { JudgeCount } from "@/api/records/types";
import {
    getJudgeColor,
    JudgeDistributionChart,
    OverallJudgmentDistributionChart,
} from "@/components/JudgeDistributionCharts";
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

function PageRecordsLast50Detail() {
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
        return <Alert severity="error">Record id not found.</Alert>;
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                <Box>
                    <Typography variant="h5" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton component={Link} to="/records/game" size="small">
                            <ArrowBackIosNewIcon />
                        </IconButton>
                        Play Log Detail
                    </Typography>
                    <Typography color="textSecondary">Detailed result for this play record.</Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => void records.refreshPlayLogDetail(id)}
                        loading={loading}
                        disabled={loading}
                    >
                        Reload
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
                                            label={`FAST ${detail.fast.toLocaleString()}`}
                                        />
                                        <Chip
                                            color="secondary"
                                            variant="outlined"
                                            label={`LATE ${detail.late.toLocaleString()}`}
                                        />
                                        <Chip
                                            color={
                                                detail.ratingDirection === "up"
                                                    ? "success"
                                                    : detail.ratingDirection === "down"
                                                      ? "error"
                                                      : "default"
                                            }
                                            label={`Rating ${detail.ratingResult.toLocaleString()} (${detail.ratingDelta > 0 ? "+" : ""}${detail.ratingDelta.toLocaleString()})`}
                                        />
                                        <Chip
                                            color="primary"
                                            label={`Max Combo ${detail.maxCombo.current.toLocaleString()} / ${detail.maxCombo.max.toLocaleString()}`}
                                        />
                                        <Chip
                                            color="secondary"
                                            label={`Max Sync ${detail.maxSync.current.toLocaleString()} / ${detail.maxSync.max.toLocaleString()}`}
                                        />
                                    </Stack>

                                    <Box sx={{ overflowX: "auto" }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Note</TableCell>
                                                    {judgeLabels.map((judge) => (
                                                        <TableCell
                                                            key={judge.key}
                                                            align="right"
                                                            sx={{
                                                                color: getJudgeColor(judge.key, isDarkMode),
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {judge.label}
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

                    <Grid size={{ xs: 12 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="h6">Judge Distribution</Typography>
                                        <Typography color="textSecondary">
                                            Judgment counts split by note type.
                                        </Typography>
                                    </Box>
                                    <JudgeDistributionChart data={detail.judge} />
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Card variant="outlined">
                            <CardContent>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="h6">Overall Judgment Distribution</Typography>
                                        <Typography color="textSecondary">
                                            Total judgment counts across all note types.
                                        </Typography>
                                    </Box>
                                    <OverallJudgmentDistributionChart data={detail.judge} />
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
