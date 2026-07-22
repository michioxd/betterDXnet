import { difficultyColor, GameRecordStatus, type GameRecordLast50 } from "@/api/records";
import {
    GameRecordMode,
    GameRecordSyncStatusShort,
    musicIconBaseImg,
    playlogBaseImg,
    songKindBaseImg,
} from "@/api/records/types";
import { rootStore } from "@/stores/root";
import HeartIcon from "@mui/icons-material/Favorite";
import ClockIcon from "@mui/icons-material/AccessTime";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { netImageBase } from "@/api/helper";
import { calculateRating } from "@/utils/rating";

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

export function colorFromSessionStart(value: Date) {
    return colorFromHue(hueFromSessionStart(value));
}

export function RecordCard({
    record,
    sessionColor,
    to = `/records/game/${record.id}`,
}: {
    record: GameRecordLast50;
    sessionColor: string;
    to?: string;
}) {
    const { t } = useTranslation("records");
    const color = difficultyColor[record.songdifficulty];

    return (
        <Card
            variant="outlined"
            sx={{
                position: "relative",
                height: "100%",
                borderColor: color,
                bgcolor: `color-mix(in srgb, ${color} 5%, transparent)`,
            }}
        >
            <CardActionArea component={Link} to={to} sx={{ height: "100%" }}>
                <CardContent sx={{ height: "100%" }}>
                    <Stack spacing={2} sx={{ height: "100%" }}>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ position: "relative" }}>
                                <CardMedia
                                    component="img"
                                    image={record.songArtwork}
                                    alt={record.songTitle}
                                    sx={{
                                        width: 95,
                                        height: 95,
                                        borderRadius: 1,
                                        objectFit: "cover",
                                        flexShrink: 0,
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        filter: "blur(8px)",
                                        opacity: 0.6,
                                        zIndex: 0,
                                        transform: "scale(1.05)",
                                    }}
                                />
                                <CardMedia
                                    component="img"
                                    image={record.songArtwork}
                                    alt={record.songTitle}
                                    sx={{
                                        width: 95,
                                        height: 95,
                                        borderRadius: 1,
                                        objectFit: "cover",
                                        flexShrink: 0,
                                        zIndex: 1,
                                        position: "relative",
                                    }}
                                />

                                <img
                                    src={songKindBaseImg.replace(
                                        "{}",
                                        record.songKind === "std" ? "standard" : record.songKind,
                                    )}
                                    alt={record.songKind}
                                    style={{ position: "absolute", bottom: -5, right: -5, height: "18px", zIndex: 2 }}
                                />
                            </Box>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                {record.songFullDetail?.song.artist && (
                                    <Typography
                                        variant="subtitle2"
                                        color="textSecondary"
                                        noWrap
                                        sx={{ fontSize: "12px" }}
                                    >
                                        {record.songFullDetail?.song.artist || "untitled"}
                                    </Typography>
                                )}
                                <Typography variant="subtitle1" noWrap title={record.songTitle}>
                                    {record.songTitle || t("card.untitled")}
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
                                        label={t("card.trackNo", { trackNo: record.trackNo })}
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
                                        {t("card.achievement")}
                                    </Typography>
                                    {record.newAchievement && (
                                        <Chip
                                            size="small"
                                            sx={{ fontSize: 10, width: "fit-content", height: "fit-content", py: 0 }}
                                            color="warning"
                                            label={t("card.new")}
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
                                            sx={{ fontSize: 10, width: "fit-content", height: "fit-content", py: 0 }}
                                            color="warning"
                                            label={t("card.new")}
                                        />
                                    )}
                                    <Typography variant="body2" color="textSecondary">
                                        {t("card.dxScore")}
                                    </Typography>
                                </Box>
                                <Typography variant="body1">
                                    {record.dxScore.current.toLocaleString()} / {record.dxScore.max.toLocaleString()}
                                </Typography>
                            </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
                            {record.status !== GameRecordStatus.FAILED &&
                                record.status !== GameRecordStatus.CLEARED && (
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
                                <>
                                    <img
                                        src={musicIconBaseImg.replace("{}", record.syncStatusShort)}
                                        style={{
                                            width: "45px",
                                            height: "45px",
                                            objectFit: "cover",
                                        }}
                                    />
                                    <img
                                        src={playlogBaseImg.replace("{}", record.syncPlayGrade)}
                                        style={{
                                            width: "45px",
                                            height: "45px",
                                            objectFit: "contain",
                                        }}
                                    />
                                </>
                            )}

                            {record.dxStar > 0 && (
                                <img
                                    src={musicIconBaseImg.replace("{}", "dxstar_" + record.dxStar)}
                                    style={{
                                        width: "45px",
                                        height: "45px",
                                        objectFit: "contain",
                                    }}
                                />
                            )}
                            {record.songFullDetail && record.songFullDetail.sheet.internalLevelValue && (
                                <>
                                    <Box sx={{ flex: 1, m: "0 !important" }}></Box>
                                    <Tooltip title={"DX Rating"} placement="top" arrow>
                                        <Typography variant="h5">
                                            {calculateRating(
                                                record.achievement,
                                                record.songFullDetail.sheet.internalLevelValue,
                                            )}
                                        </Typography>
                                    </Tooltip>
                                </>
                            )}
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

                            {record.mode !== GameRecordMode.NORMAL && (
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        flexWrap: "wrap",
                                        rowGap: 1,
                                        mb: 1,
                                        alignItems: "center",
                                        justifyContent: "flex-end",
                                    }}
                                >
                                    {record.mode === GameRecordMode.PERFECT_CHALLENGE && (
                                        <img
                                            src={netImageBase.replace("{}", "icon_perfectchallenge")}
                                            style={{
                                                width: "75px",
                                                height: "30px",
                                                objectFit: "contain",
                                                objectPosition: "center",
                                            }}
                                        />
                                    )}
                                    {record.mode === GameRecordMode.KALEIDXSCOPE && (
                                        <img
                                            src={netImageBase.replace("{}", "icon_kaleidxscope")}
                                            style={{
                                                width: "75px",
                                                height: "30px",
                                                objectFit: "contain",
                                                objectPosition: "center",
                                            }}
                                        />
                                    )}
                                    <Chip
                                        size="small"
                                        color={record.liveStatus.current <= 0 ? "error" : "secondary"}
                                        icon={<HeartIcon />}
                                        label={t("card.life", {
                                            current: record.liveStatus.current,
                                            max: record.liveStatus.max,
                                        })}
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
                />
            </CardActionArea>
        </Card>
    );
}

function PageRecordsLast50() {
    const { t } = useTranslation("records");
    const { app, records } = rootStore;
    const loading = records.last50Loading;
    const error = records.last50Error;

    useEffect(() => {
        void records.ensureLast50();
    }, [records]);

    useEffect(() => {
        app.setGlobalLoading(loading);
    }, [app, loading]);

    const sortedRecords = useMemo(
        () => [...records.last50].sort((left, right) => right.playDate.getTime() - left.playDate.getTime()),
        [records.last50],
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
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                <Box>
                    <Typography variant="h5">{t("last50.title")}</Typography>
                    <Typography color="textSecondary">{t("last50.description")}</Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => void records.refreshLast50()}
                    loading={loading}
                    disabled={loading}
                >
                    {t("last50.reload")}
                </Button>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error">{error.message}</Alert>}

            {!loading && !error && (
                <>
                    <Typography color="textSecondary">
                        {t("last50.showingRecords", { count: sortedRecords.length })}
                    </Typography>

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

export default observer(PageRecordsLast50);
