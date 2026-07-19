import { apiRecords } from "@/api";
import { difficultyColor, GameRecordStatus, type GameRecordLast50 } from "@/api/records";
import { GameRecordSyncStatusShort, musicIconBaseImg, playlogBaseImg, songKindBaseImg } from "@/api/records/types";
import { rootStore } from "@/stores/root";
import HeartIcon from "@mui/icons-material/Favorite";
import ClockIcon from "@mui/icons-material/AccessTime";
import {
    Alert,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
});

const fullDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "long",
});

const minSessionHueDistance = 50;

function formatPercent(value: number) {
    return `${value.toFixed(4)}%`;
}

function formatDate(value: Date, isFull = false) {
    if (Number.isNaN(value.getTime())) {
        return "-";
    }

    if (isFull) {
        return fullDateTimeFormatter.format(value);
    }

    return dateTimeFormatter.format(value);
}

function hueFromSessionStart(value: Date) {
    const minutes = value.getHours() * 60 + value.getMinutes();

    return Math.round((minutes / 1440) * 360);
}

function hueDistance(left: number, right: number) {
    const distance = Math.abs(left - right) % 360;

    return Math.min(distance, 360 - distance);
}

function makeDistinctSessionHue(hue: number, previousHue: number | null) {
    if (previousHue === null || hueDistance(hue, previousHue) >= minSessionHueDistance) {
        return hue;
    }

    return (hue + 180) % 360;
}

function colorFromHue(hue: number) {
    return `hsl(${hue} 85% 58%)`;
}

function colorFromSessionStart(value: Date) {
    return colorFromHue(hueFromSessionStart(value));
}

function RecordCard({ record, sessionColor }: { record: GameRecordLast50; sessionColor: string }) {
    const color = difficultyColor[record.songdifficulty];

    return (
        <Card
            variant="outlined"
            sx={{
                position: "relative",
                height: "100%",
                borderColor: color,
                bgcolor: `color-mix(in srgb, ${color} 10%, transparent)`,
            }}
        >
            <CardContent sx={{ height: "100%" }}>
                <Stack spacing={2} sx={{ height: "100%" }}>
                    <Stack direction="row" spacing={2}>
                        <Box sx={{ position: "relative" }}>
                            <CardMedia
                                component="img"
                                image={record.songArtwork}
                                alt={record.songTitle}
                                sx={{ width: 88, height: 88, borderRadius: 1, objectFit: "cover", flexShrink: 0 }}
                            />
                            <img
                                src={songKindBaseImg.replace("{}", record.songKind)}
                                alt={record.songKind}
                                style={{ position: "absolute", bottom: -5, right: -5, height: "18px" }}
                            />
                        </Box>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="subtitle1" noWrap title={record.songTitle}>
                                {record.songTitle || "Untitled"}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                                <Chip
                                    size="small"
                                    label={record.songdifficulty.toUpperCase()}
                                    sx={{ bgcolor: color, color: "common.black", fontWeight: 700 }}
                                />
                                <Chip size="small" label={`Lv ${record.songLevel}`} />
                                <Chip
                                    size="small"
                                    label={`No. ${record.trackNo}`}
                                    sx={{
                                        bgcolor: "color-mix(in srgb, " + sessionColor + " 20%, transparent)",
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Stack>

                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                        <Stack direction="column" sx={{ justifyContent: "flex-start", alignItems: "flex-start" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Achievement
                                </Typography>
                                {record.newAchievement && (
                                    <Chip
                                        size="small"
                                        sx={{ fontSize: 10, width: "fit-content", height: "fit-content" }}
                                        color="warning"
                                        label="NEW"
                                    />
                                )}
                            </Box>
                            <Typography variant="h6" color="primary.main">
                                {formatPercent(record.achievement)}
                            </Typography>
                        </Stack>

                        <Stack>
                            <img
                                src={playlogBaseImg.replace("{}", record.scoreRank.toLowerCase())}
                                alt={record.scoreRank}
                                style={{ height: "50px" }}
                            />
                        </Stack>

                        <Stack direction="column" sx={{ justifyContent: "flex-start", alignItems: "flex-end" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                {record.newDxScore && (
                                    <Chip
                                        size="small"
                                        sx={{ fontSize: 10, width: "fit-content", height: "fit-content" }}
                                        color="warning"
                                        label="NEW"
                                    />
                                )}
                                <Typography variant="body2" color="textSecondary">
                                    DX Score
                                </Typography>
                            </Box>
                            <Typography variant="body1">
                                {record.dxScore.current.toLocaleString()} / {record.dxScore.max.toLocaleString()}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
                        {record.status !== GameRecordStatus.FAILED && record.status !== GameRecordStatus.CLEARED && (
                            <img
                                src={musicIconBaseImg.replace("{}", record.status)}
                                alt={record.syncPlayGrade}
                                style={{
                                    width: "45px",
                                    height: "45px",
                                    objectFit: "cover",
                                }}
                            />
                        )}
                        {record.syncStatusShort !== GameRecordSyncStatusShort.SOLO && (
                            <img
                                src={musicIconBaseImg.replace("{}", record.syncStatusShort)}
                                style={{
                                    width: "45px",
                                    height: "45px",
                                    objectFit: "cover",
                                }}
                            />
                        )}
                        {record.dxStar > 0 && <Chip color="success" label={`${record.dxStar}★`} />}
                    </Stack>

                    <Box sx={{ flex: 1, m: "0 !important" }}></Box>

                    <Box
                        sx={{
                            mt: "auto",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            rowGap: 1,
                        }}
                    >
                        <Box>
                            <Tooltip title={formatDate(record.playDate, true)} placement="top" arrow>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{ display: "flex", alignItems: "center", gap: 0.5, width: "fit-content" }}
                                >
                                    <ClockIcon />
                                    {formatDate(record.playDate)}
                                </Typography>
                            </Tooltip>
                        </Box>

                        {record.isPerfectChallenge && (
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", rowGap: 1, mb: 1 }}>
                                <Tooltip title="Perfect Challenge" placement="top" arrow>
                                    <Chip size="small" color="warning" sx={{ fontWeight: 700 }} label="PC" />
                                </Tooltip>
                                <Chip
                                    size="small"
                                    color="secondary"
                                    icon={<HeartIcon />}
                                    label={`LIFE ${record.liveStatus.current} / ${record.liveStatus.max}`}
                                ></Chip>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </CardContent>
            <Box
                sx={{
                    width: "100%",
                    height: 4,
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    opacity: 0.4,
                    bgcolor: sessionColor,
                }}
            ></Box>
        </Card>
    );
}

export default function PageRecordsLast50() {
    const { app } = rootStore;
    const [records, setRecords] = useState<GameRecordLast50[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const disposedRef = useRef(false);

    useEffect(() => {
        disposedRef.current = false;

        (async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await apiRecords.last50();

                if (disposedRef.current) return;

                setRecords(res);
            } catch (error) {
                if (disposedRef.current) return;

                setError(error as Error);
            } finally {
                if (disposedRef.current) return;

                setLoading(false);
            }
        })();

        return () => {
            disposedRef.current = true;
        };
    }, []);

    useEffect(() => {
        app.setGlobalLoading(loading);
    }, [app, loading]);

    const sortedRecords = useMemo(
        () => [...records].sort((left, right) => right.playDate.getTime() - left.playDate.getTime()),
        [records],
    );

    const recordsWithSessionColor = useMemo(() => {
        let currentSessionStart: Date | null = null;
        let currentSessionHue = 0;
        let previousSessionHue: number | null = null;
        let previousTrackNo: number | null = null;
        const colorByRecord = new Map<GameRecordLast50, string>();

        [...sortedRecords]
            .sort((left, right) => left.playDate.getTime() - right.playDate.getTime())
            .forEach((record) => {
                if (previousTrackNo === null || record.trackNo !== previousTrackNo + 1) {
                    currentSessionStart = record.playDate;
                    currentSessionHue = makeDistinctSessionHue(
                        hueFromSessionStart(currentSessionStart),
                        previousSessionHue,
                    );
                    previousSessionHue = currentSessionHue;
                }

                colorByRecord.set(record, colorFromHue(currentSessionHue));
                previousTrackNo = record.trackNo;
            });

        return sortedRecords.map((record) => ({
            record,
            sessionColor: colorByRecord.get(record) ?? colorFromSessionStart(record.playDate),
        }));
    }, [sortedRecords]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5">Last 50</Typography>
                <Typography color="textSecondary">Recent play records.</Typography>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error">{error.message}</Alert>}

            {!loading && !error && (
                <>
                    <Typography color="textSecondary">Showing {sortedRecords.length} records</Typography>

                    <Grid container spacing={2}>
                        {recordsWithSessionColor.map(({ record, sessionColor }, index) => (
                            <Grid key={`${record.id}-${index}`} size={{ xs: 12, md: 6, xl: 4 }}>
                                <RecordCard record={record} sessionColor={sessionColor} />
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Box>
    );
}
