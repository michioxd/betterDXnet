import { difficultyColor, GameRecordSongDifficulty, GameRecordStatus, type GameRecordSong } from "@/api/records";
import { musicIconBaseImg, playlogBaseImg, songKindBaseImg } from "@/api/records/types";
import ImgLazyload from "@/components/Img.Lazyload";
import { dataSource } from "@/db/maimaiDataTypes";
import { rootStore } from "@/stores/root";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import CloseIcon from "@mui/icons-material/Close";
import Yot from "@mui/icons-material/YouTube";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
    Paper,
    CardActionArea,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type ViewMode = "card" | "table";

const STORAGE_KEY_DIFFICULTIES = "bdn.songRecords.difficulties";
const STORAGE_KEY_VIEW_MODE = "bdn.songRecords.viewMode";

const difficulties = [
    GameRecordSongDifficulty.BASIC,
    GameRecordSongDifficulty.ADVANCED,
    GameRecordSongDifficulty.EXPERT,
    GameRecordSongDifficulty.MASTER,
    GameRecordSongDifficulty.REMASTER,
    GameRecordSongDifficulty.UTAGE,
];

function formatPercent(value: number) {
    return `${value.toFixed(4)}%`;
}

function getArtworkUrl(record: GameRecordSong) {
    return record.songFullDetail ? dataSource.getSongArtworkUrl(record.songFullDetail.song) : "";
}

function formatDate(value: Date) {
    if (Number.isNaN(value.getTime())) return "-";

    return value.toLocaleString();
}

function loadSelectedDifficulties() {
    const stored = localStorage.getItem(STORAGE_KEY_DIFFICULTIES);

    if (!stored) return [GameRecordSongDifficulty.MASTER];

    try {
        const parsed = JSON.parse(stored) as GameRecordSongDifficulty[];
        const selected = parsed.filter((diff) => difficulties.includes(diff));

        return selected.length > 0 ? selected : [GameRecordSongDifficulty.MASTER];
    } catch {
        return [GameRecordSongDifficulty.MASTER];
    }
}

function loadViewMode() {
    const stored = localStorage.getItem(STORAGE_KEY_VIEW_MODE);

    return stored === "table" || stored === "card" ? stored : "card";
}

function SongRecordCard({ record, onSelect }: { record: GameRecordSong; onSelect: (record: GameRecordSong) => void }) {
    const { t } = useTranslation("records");
    const color = difficultyColor[record.songdifficulty];
    const artworkUrl = getArtworkUrl(record);

    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                borderColor: color,
                bgcolor: `color-mix(in srgb, ${color} 5%, transparent)`,
                cursor: "pointer",
            }}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(record)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(record);
                }
            }}
        >
            <CardActionArea>
                <CardContent sx={{ height: "100%" }}>
                    <Stack spacing={2} sx={{ height: "100%" }}>
                        <Stack direction="row" spacing={2}>
                            {artworkUrl && (
                                <Box sx={{ position: "relative", flexShrink: 0 }}>
                                    <ImgLazyload
                                        src={artworkUrl}
                                        alt={record.songTitle}
                                        sx={{
                                            width: 88,
                                            height: 88,
                                            borderRadius: 1,
                                            objectFit: "cover",
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            filter: "blur(8px)",
                                            opacity: 0.55,
                                            transform: "scale(1.05)",
                                        }}
                                    />
                                    <ImgLazyload
                                        src={artworkUrl}
                                        alt={record.songTitle}
                                        sx={{
                                            width: 88,
                                            height: 88,
                                            borderRadius: 1,
                                            objectFit: "cover",
                                            position: "relative",
                                        }}
                                    />
                                    <ImgLazyload
                                        src={songKindBaseImg.replace(
                                            "{}",
                                            record.songKind === "std" ? "standard" : record.songKind,
                                        )}
                                        alt={record.songKind}
                                        sx={{ position: "absolute", bottom: -5, right: -5, height: 18 }}
                                    />
                                </Box>
                            )}

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                {record.songFullDetail?.song.artist && (
                                    <Typography variant="subtitle2" color="textSecondary" noWrap sx={{ fontSize: 12 }}>
                                        {record.songFullDetail.song.artist}
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
                                    {record.songFullDetail ? (
                                        <Tooltip
                                            title={"" + record.songFullDetail.sheet.internalLevelValue}
                                            placement="top"
                                            arrow
                                        >
                                            <Chip size="small" label={`Lv ${record.songLevel}`} />
                                        </Tooltip>
                                    ) : (
                                        <Chip size="small" label={`Lv ${record.songLevel}`} />
                                    )}
                                </Stack>
                            </Box>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{ alignItems: "center", justifyContent: "space-between" }}
                        >
                            <Box>
                                <Typography variant="caption" color="textSecondary">
                                    {t("songRecords.achievement")}
                                </Typography>
                                <Typography variant="h6" color="primary.main">
                                    {formatPercent(record.achievement)}
                                </Typography>
                            </Box>

                            <ImgLazyload
                                src={playlogBaseImg.replace("{}", record.scoreRank)}
                                alt={record.scoreRank}
                                sx={{ height: 44, objectFit: "contain" }}
                            />

                            <Box sx={{ textAlign: "right" }}>
                                <Typography variant="caption" color="textSecondary">
                                    {t("songRecords.rating")}
                                </Typography>
                                <Tooltip
                                    title={record.rating === undefined ? t("songRecords.ratingUnavailable") : ""}
                                    arrow
                                >
                                    <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <StarIcon
                                            fontSize="small"
                                            color={record.rating === undefined ? "disabled" : "warning"}
                                        />
                                        {record.rating ?? "-"}
                                    </Typography>
                                </Tooltip>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", alignItems: "center" }}>
                            {record.status !== GameRecordStatus.FAILED &&
                                record.status !== GameRecordStatus.CLEARED && (
                                    <ImgLazyload
                                        src={musicIconBaseImg.replace("{}", record.status.replace("plus", "p"))}
                                        alt={record.status}
                                        sx={{ width: 40, height: 40, objectFit: "contain" }}
                                    />
                                )}
                            {record.syncStatusShort !== "solo" && (
                                <ImgLazyload
                                    src={musicIconBaseImg.replace("{}", record.syncStatusShort)}
                                    alt={record.syncStatusShort}
                                    sx={{ width: 40, height: 40, objectFit: "contain" }}
                                />
                            )}
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

function SongRecordsTable({
    records,
    onSelect,
}: {
    records: GameRecordSong[];
    onSelect: (record: GameRecordSong) => void;
}) {
    const { t } = useTranslation("records");

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>{t("songRecords.table.song")}</TableCell>
                        <TableCell></TableCell>
                        <TableCell>{t("songRecords.table.difficulty")}</TableCell>
                        <TableCell>{t("songRecords.table.achievement")}</TableCell>
                        <TableCell>{t("songRecords.table.dxScore")}</TableCell>
                        <TableCell>{t("songRecords.table.rank")}</TableCell>
                        <TableCell>{t("songRecords.table.rating")}</TableCell>
                        <TableCell>{t("songRecords.table.status")}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {records.map((record, index) => {
                        const color = difficultyColor[record.songdifficulty];

                        return (
                            <TableRow
                                key={`${record.id}-${record.songdifficulty}-${index}`}
                                hover
                                onClick={() => onSelect(record)}
                                sx={{ cursor: "pointer" }}
                            >
                                <TableCell>
                                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                                        {getArtworkUrl(record) && (
                                            <ImgLazyload
                                                src={getArtworkUrl(record)}
                                                alt={record.songTitle}
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 1,
                                                    objectFit: "cover",
                                                }}
                                            />
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", minWidth: 240 }}>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="body2" noWrap title={record.songTitle}>
                                                {record.songTitle || t("card.untitled")}{" "}
                                                <ImgLazyload
                                                    src={songKindBaseImg.replace(
                                                        "{}",
                                                        record.songKind === "std" ? "standard" : record.songKind,
                                                    )}
                                                    alt={record.songKind}
                                                    sx={{ width: 40, objectFit: "contain", flexShrink: 0, ml: 0.5 }}
                                                />
                                            </Typography>
                                            {record.songFullDetail?.song.artist && (
                                                <Typography variant="caption" color="textSecondary" noWrap>
                                                    {record.songFullDetail.song.artist}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                        <Chip
                                            size="small"
                                            label={record.songdifficulty.toUpperCase()}
                                            sx={{ bgcolor: color, color: "common.black", fontWeight: 700 }}
                                        />
                                        <Typography variant="body2">
                                            {record.songLevel}
                                            <Typography component="span" color="textSecondary" variant="body2">
                                                {record.songFullDetail
                                                    ? ` (${record.songFullDetail.sheet.internalLevelValue})`
                                                    : ""}
                                            </Typography>
                                        </Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>{formatPercent(record.achievement)}</TableCell>
                                <TableCell>
                                    {record.dxScore.current.toLocaleString()} / {record.dxScore.max.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <ImgLazyload
                                        src={playlogBaseImg.replace("{}", record.scoreRank)}
                                        alt={record.scoreRank}
                                        sx={{ height: 32, objectFit: "contain" }}
                                    />
                                </TableCell>
                                <TableCell>{record.rating ?? "-"}</TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={0.2} sx={{ alignItems: "center" }}>
                                        {record.status !== GameRecordStatus.FAILED &&
                                            record.status !== GameRecordStatus.CLEARED && (
                                                <ImgLazyload
                                                    src={musicIconBaseImg.replace(
                                                        "{}",
                                                        record.status.replace("plus", "p"),
                                                    )}
                                                    alt={record.status}
                                                    sx={{ width: 32, height: 32, objectFit: "contain" }}
                                                />
                                            )}
                                        {record.syncStatusShort !== "solo" && (
                                            <ImgLazyload
                                                src={musicIconBaseImg.replace("{}", record.syncStatusShort)}
                                                alt={record.syncStatusShort}
                                                sx={{ width: 32, height: 32, objectFit: "contain" }}
                                            />
                                        )}
                                        {record.status === GameRecordStatus.CLEARED &&
                                            record.syncStatusShort === "solo" && (
                                                <Typography variant="body2" color="textSecondary">
                                                    -
                                                </Typography>
                                            )}
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

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
    const detail = record ? records.getSongRecordDetail(record.id) : undefined;
    const loading = record ? records.isSongRecordDetailLoading(record.id) : false;
    const error = record ? records.getSongRecordDetailError(record.id) : null;
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
                                        src={songKindBaseImg.replace(
                                            "{}",
                                            record.songKind === "std" ? "standard" : record.songKind,
                                        )}
                                        alt={record.songKind}
                                        sx={{
                                            width: 60,
                                            objectFit: "contain",
                                        }}
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
                                    const color = difficultyColor[difficulty];

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
                                                            {formatDate(level.lastPlayedDate)}
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
                                                        src={playlogBaseImg.replace("{}", level.scoreRank)}
                                                        alt={level.scoreRank}
                                                        sx={{ height: 36, objectFit: "contain" }}
                                                    />
                                                    {level.status !== GameRecordStatus.FAILED &&
                                                        level.status !== GameRecordStatus.CLEARED && (
                                                            <ImgLazyload
                                                                src={musicIconBaseImg.replace(
                                                                    "{}",
                                                                    level.status.replace("plus", "p"),
                                                                )}
                                                                alt={level.status}
                                                                sx={{ width: 36, height: 36, objectFit: "contain" }}
                                                            />
                                                        )}
                                                    {level.syncStatusShort !== "solo" && (
                                                        <ImgLazyload
                                                            src={musicIconBaseImg.replace("{}", level.syncStatusShort)}
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

function PageRecordsSongRecord() {
    const { t } = useTranslation("records");
    const { app, records } = rootStore;
    const [selectedDifficulties, setSelectedDifficulties] =
        useState<GameRecordSongDifficulty[]>(loadSelectedDifficulties);
    const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);
    const [selectedRecord, setSelectedRecord] = useState<GameRecordSong | null>(null);
    const loading = records.songRecordsLoading;
    const error = records.songRecordsError;

    useEffect(() => {
        void records.ensureSongRecords(selectedDifficulties);
    }, [records, selectedDifficulties]);

    useEffect(() => {
        app.setGlobalLoading(loading);
    }, [app, loading]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_DIFFICULTIES, JSON.stringify(selectedDifficulties));
    }, [selectedDifficulties]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY_VIEW_MODE, viewMode);
    }, [viewMode]);

    const visibleRecords = useMemo(
        () =>
            selectedDifficulties
                .flatMap((diff) => records.songRecords[diff] ?? [])
                .sort(
                    (left, right) => (right.rating ?? 0) - (left.rating ?? 0) || right.achievement - left.achievement,
                ),
        [records.songRecords, selectedDifficulties],
    );

    const handleDifficultyChange = (event: SelectChangeEvent<GameRecordSongDifficulty[]>) => {
        const value = event.target.value;

        setSelectedDifficulties(typeof value === "string" ? (value.split(",") as GameRecordSongDifficulty[]) : value);
    };

    const handleRefresh = () => {
        void records.refreshSongRecords(selectedDifficulties);
    };

    const handleCloseDetail = () => {
        setSelectedRecord(null);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                <Box>
                    <Typography variant="h5">{t("songRecords.title")}</Typography>
                    <Typography color="textSecondary">{t("songRecords.description")}</Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    loading={loading}
                    disabled={loading || selectedDifficulties.length === 0}
                >
                    {t("songRecords.reload")}
                </Button>
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ justifyContent: "space-between" }}>
                <FormControl sx={{ minWidth: { xs: "100%", md: 360 } }}>
                    <InputLabel id="song-record-difficulty-label">{t("songRecords.filters.difficulty")}</InputLabel>
                    <Select
                        labelId="song-record-difficulty-label"
                        multiple
                        value={selectedDifficulties}
                        input={<OutlinedInput label={t("songRecords.filters.difficulty")} />}
                        onChange={handleDifficultyChange}
                        renderValue={(selected) => selected.map((diff) => diff.toUpperCase()).join(", ")}
                    >
                        {difficulties.map((diff) => (
                            <MenuItem key={diff} value={diff}>
                                <Checkbox checked={selectedDifficulties.includes(diff)} />
                                <ListItemText primary={diff.toUpperCase()} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box>
                    <ToggleButtonGroup
                        exclusive
                        value={viewMode}
                        onChange={(_, value: ViewMode | null) => value && setViewMode(value)}
                        size="small"
                    >
                        <ToggleButton value="card">
                            <ViewModuleIcon fontSize="small" />
                            &nbsp;
                            {t("songRecords.view.card")}
                        </ToggleButton>
                        <ToggleButton value="table">
                            <ViewListIcon fontSize="small" />
                            &nbsp;
                            {t("songRecords.view.table")}
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Stack>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error">{error.message}</Alert>}

            {!loading && !error && selectedDifficulties.length === 0 && (
                <Alert severity="info">{t("songRecords.selectDifficulty")}</Alert>
            )}

            {!loading && !error && selectedDifficulties.length > 0 && (
                <>
                    <Typography color="textSecondary">
                        {t("songRecords.showingRecords", { count: visibleRecords.length })}
                    </Typography>

                    {visibleRecords.length === 0 ? (
                        <Alert severity="info">{t("songRecords.empty")}</Alert>
                    ) : viewMode === "card" ? (
                        <Grid container spacing={2}>
                            {visibleRecords.map((record, index) => (
                                <Grid
                                    key={`${record.id}-${record.songdifficulty}-${index}`}
                                    size={{ xs: 12, md: 6, xl: 4 }}
                                >
                                    <SongRecordCard record={record} onSelect={setSelectedRecord} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <SongRecordsTable records={visibleRecords} onSelect={setSelectedRecord} />
                    )}
                </>
            )}

            <SongRecordDetailDialog
                record={selectedRecord}
                open={selectedRecord !== null}
                onClose={handleCloseDetail}
            />
        </Box>
    );
}

export default observer(PageRecordsSongRecord);
