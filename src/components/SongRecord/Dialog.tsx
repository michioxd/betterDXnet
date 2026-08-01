import { GameRecordStatus, type GameRecordSong, GameRecordSongDifficulty } from "@/api/records";
import { rootStore } from "@/stores/root";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import Yot from "@mui/icons-material/YouTube";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import ImgLazyload from "@/components/Img.Lazyload";
import { difficulties, formatPercent, getArtworkUrl, getSongKindImageUrl } from "./shared";

const SongRecordDetailDialog = observer(function SongRecordDetailDialog({
    record,
    open,
    onClose,
}: {
    record: GameRecordSong | null;
    open: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation("records");
    const { records } = rootStore;
    const songRecordDetails = records.songRecordDetails;
    const songRecordDetailLoading = records.songRecordDetailLoading;
    const songRecordDetailErrors = records.songRecordDetailErrors;
    const detail = record ? songRecordDetails[record.id] : undefined;
    const loading = record ? (songRecordDetailLoading[record.id] ?? false) : false;
    const error = record ? (songRecordDetailErrors[record.id] ?? null) : null;
    const artworkUrl = record ? getArtworkUrl(record) : "";

    useEffect(() => {
        if (open && record) {
            void records.ensureSongRecordDetail(record.id);
        }
    }, [open, record, records]);

    const levelEntries = detail
        ? difficulties
              .map((difficulty) => [difficulty, detail.levels[difficulty]] as const)
              .filter((entry): entry is [GameRecordSongDifficulty, NonNullable<(typeof entry)[1]>] => !!entry[1])
        : [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pr: 6 }}>
                {record?.songTitle || t("card.untitled")}
                <IconButton aria-label="close" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {!record ? null : (
                    <Stack spacing={2}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            {artworkUrl && (
                                <ImgLazyload
                                    src={artworkUrl}
                                    alt={record.songTitle}
                                    sx={{ width: 128, height: 128, borderRadius: 1, objectFit: "cover" }}
                                />
                            )}
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="h6">{record.songTitle || t("card.untitled")}</Typography>
                                {record.songFullDetail?.song.artist && (
                                    <Typography color="textSecondary">{record.songFullDetail.song.artist}</Typography>
                                )}
                                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                                    <ImgLazyload
                                        src={getSongKindImageUrl(record.songKind)}
                                        alt={record.songKind}
                                        sx={{ width: 60, objectFit: "contain" }}
                                    />
                                    {record.songFullDetail?.song.category && (
                                        <Chip size="small" label={record.songFullDetail.song.category} />
                                    )}
                                    {record.songFullDetail?.song.version && (
                                        <Chip size="small" label={record.songFullDetail.song.version} />
                                    )}
                                </Stack>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent((record.songFullDetail?.song.artist ?? "") + " - " + (record.songTitle ?? ""))}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    startIcon={<Yot />}
                                    size="small"
                                    sx={{ mt: 1 }}
                                >
                                    YouTube
                                </Button>
                            </Box>
                        </Stack>

                        <Divider />

                        {loading && (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                <CircularProgress />
                            </Box>
                        )}

                        {error && <Alert severity="error">{error.message}</Alert>}

                        {!loading && !error && detail && (
                            <Stack spacing={1.5}>
                                {levelEntries.map(([difficulty, level]) => {
                                    const color = {
                                        [GameRecordSongDifficulty.BASIC]: "#45c124",
                                        [GameRecordSongDifficulty.ADVANCED]: "#ffba01",
                                        [GameRecordSongDifficulty.EXPERT]: "#ff7b7b",
                                        [GameRecordSongDifficulty.MASTER]: "#9f51dc",
                                        [GameRecordSongDifficulty.REMASTER]: "#dbaaff",
                                        [GameRecordSongDifficulty.UTAGE]: "#FF6FFD",
                                    }[difficulty];

                                    return (
                                        <Paper
                                            key={difficulty}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                borderColor: difficulty === record.songdifficulty ? color : "divider",
                                                bgcolor: `color-mix(in srgb, ${color} 4%, transparent)`,
                                            }}
                                        >
                                            <Stack spacing={1.5}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
                                                >
                                                    <Chip
                                                        size="small"
                                                        label={difficulty.toUpperCase()}
                                                        sx={{ bgcolor: color, color: "common.black", fontWeight: 700 }}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`Lv ${level.sheetDetail?.level ?? record.songLevel}`}
                                                    />
                                                    {level.sheetDetail?.internalLevelValue && (
                                                        <Chip
                                                            size="small"
                                                            label={`${t("songRecords.detail.chart")} ${level.sheetDetail.internalLevelValue}`}
                                                        />
                                                    )}
                                                    <Chip
                                                        size="small"
                                                        icon={<StarIcon />}
                                                        label={`${t("songRecords.table.rating")} ${level.rating ?? "-"}`}
                                                        color={level.rating === undefined ? "default" : "warning"}
                                                    />
                                                </Stack>

                                                <Grid container spacing={1.5}>
                                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {t("songRecords.table.achievement")}
                                                        </Typography>
                                                        <Typography variant="h6" color="primary.main">
                                                            {formatPercent(level.achievement)}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {t("songRecords.table.dxScore")}
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {level.dxScore.current.toLocaleString()} /{" "}
                                                            {level.dxScore.max.toLocaleString()}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {t("songRecords.detail.lastPlayedDate")}
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {level.lastPlayedDate.toLocaleString()}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {t("songRecords.detail.playCount")}
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {level.playCount.toLocaleString()}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>

                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
                                                >
                                                    <ImgLazyload
                                                        src={`https://maimaidx-eng.com/maimai-mobile/img/playlog/${level.scoreRank}.png`}
                                                        alt={level.scoreRank}
                                                        sx={{ height: 36, objectFit: "contain" }}
                                                    />
                                                    {level.status !== GameRecordStatus.FAILED &&
                                                        level.status !== GameRecordStatus.CLEARED && (
                                                            <ImgLazyload
                                                                src={`https://maimaidx-eng.com/maimai-mobile/img/music_icon_${level.status.replace("plus", "p")}.png`}
                                                                alt={level.status}
                                                                sx={{ width: 36, height: 36, objectFit: "contain" }}
                                                            />
                                                        )}
                                                    {level.syncStatusShort !== "solo" && (
                                                        <ImgLazyload
                                                            src={`https://maimaidx-eng.com/maimai-mobile/img/music_icon_${level.syncStatusShort}.png`}
                                                            alt={level.syncStatusShort}
                                                            sx={{ width: 36, height: 36, objectFit: "contain" }}
                                                        />
                                                    )}
                                                    {level.sheetDetail?.noteDesigner && (
                                                        <Typography variant="body2" color="textSecondary">
                                                            {level.sheetDetail.noteDesigner}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        )}
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("cancel")}</Button>
            </DialogActions>
        </Dialog>
    );
});

export default SongRecordDetailDialog;
