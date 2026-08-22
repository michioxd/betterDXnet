import { GameRecordScoreRank, GameRecordSongDifficulty, GameRecordStatus, type GameRecordSong } from "@/api/records";
import {
    SongRecordCard as SongRecordCardView,
    SongRecordDetailDialog as SongRecordDetailDialogView,
    SongRecordsTable as SongRecordsTableView,
    clearStatuses,
    difficulties,
    formatClearLabel,
    formatRankLabel,
    ranks,
} from "@/components/SongRecord";
import uFuzzy from "@leeoniya/ufuzzy";
import { rootStore } from "@/stores/root";
import RefreshIcon from "@mui/icons-material/Refresh";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Slider,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type ViewMode = "card" | "table";

const STORAGE_KEY_DIFFICULTIES = "bdn.songRecords.difficulties";
const STORAGE_KEY_VIEW_MODE = "bdn.songRecords.viewMode";

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

function PageRecordsSongRecord() {
    const { t } = useTranslation("records");
    const { app, records } = rootStore;
    const [selectedDifficulties, setSelectedDifficulties] =
        useState<GameRecordSongDifficulty[]>(loadSelectedDifficulties);
    const [viewMode, setViewMode] = useState<ViewMode>(loadViewMode);
    const [searchTextDraft, setSearchTextDraft] = useState("");
    const [searchText, setSearchText] = useState("");
    const [ratingRangeDraft, setRatingRangeDraft] = useState<[number, number]>([0, 400]);
    const [ratingRange, setRatingRange] = useState<[number, number]>([0, 400]);
    const [achievementRangeDraft, setAchievementRangeDraft] = useState<[number, number]>([0, 101]);
    const [achievementRange, setAchievementRange] = useState<[number, number]>([0, 101]);
    const [selectedRanksDraft, setSelectedRanksDraft] = useState<GameRecordScoreRank[]>([]);
    const [selectedRanks, setSelectedRanks] = useState<GameRecordScoreRank[]>([]);
    const [selectedClearStatusesDraft, setSelectedClearStatusesDraft] = useState<GameRecordStatus[]>([]);
    const [selectedClearStatuses, setSelectedClearStatuses] = useState<GameRecordStatus[]>([]);
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

    useEffect(() => {
        const timer = window.setTimeout(() => setSearchText(searchTextDraft), 500);

        return () => window.clearTimeout(timer);
    }, [searchTextDraft]);

    useEffect(() => {
        const timer = window.setTimeout(() => setRatingRange(ratingRangeDraft), 500);

        return () => window.clearTimeout(timer);
    }, [ratingRangeDraft]);

    useEffect(() => {
        const timer = window.setTimeout(() => setAchievementRange(achievementRangeDraft), 500);

        return () => window.clearTimeout(timer);
    }, [achievementRangeDraft]);

    useEffect(() => {
        const timer = window.setTimeout(() => setSelectedRanks(selectedRanksDraft), 500);

        return () => window.clearTimeout(timer);
    }, [selectedRanksDraft]);

    useEffect(() => {
        const timer = window.setTimeout(() => setSelectedClearStatuses(selectedClearStatusesDraft), 500);

        return () => window.clearTimeout(timer);
    }, [selectedClearStatusesDraft]);

    const uf = useMemo(() => new uFuzzy({ unicode: true }), []);

    const visibleRecords = useMemo(() => {
        const [minRatingValue, maxRatingValue] = ratingRange;
        const [minAchievementValue, maxAchievementValue] = achievementRange;

        const allRecords = selectedDifficulties.flatMap((diff) => records.songRecords[diff] ?? []);

        let filteredRecords: GameRecordSong[];

        if (searchText.trim()) {
            const haystack = allRecords.map((record) => {
                const parts = [record.songTitle, record.songFullDetail?.song.artist ?? ""];
                const romaji = record.songFullDetail?.song.romajiTitle;
                if (romaji) parts.push(romaji);
                const romajiArtist = record.songFullDetail?.song.romajiArtist;
                if (romajiArtist) parts.push(romajiArtist);
                return parts.join(" ");
            });

            const [idxs, info, order] = uf.search(haystack, searchText.trim(), 1);

            if (!idxs || idxs.length === 0) {
                filteredRecords = [];
            } else if (info && order) {
                filteredRecords = order.map((o) => allRecords[info.idx[o]]);
            } else {
                filteredRecords = idxs.map((i) => allRecords[i]);
            }
        } else {
            filteredRecords = allRecords;
        }

        return filteredRecords
            .filter((record) => {
                if (!record.rating && minRatingValue > 0) {
                    return false;
                } else if (record.rating) {
                    if (record.rating < minRatingValue) {
                        return false;
                    }

                    if (record.rating > maxRatingValue) {
                        return false;
                    }
                }

                if (minAchievementValue !== undefined && record.achievement < minAchievementValue) {
                    return false;
                }

                if (maxAchievementValue !== undefined && record.achievement > maxAchievementValue) {
                    return false;
                }

                if (selectedRanks.length > 0 && !selectedRanks.includes(record.scoreRank)) {
                    return false;
                }

                if (selectedClearStatuses.length > 0 && !selectedClearStatuses.includes(record.status)) {
                    return false;
                }

                return true;
            })
            .sort((left, right) =>
                searchText.trim()
                    ? 0
                    : (right.rating ?? 0) - (left.rating ?? 0) || right.achievement - left.achievement,
            );
    }, [
        achievementRange,
        records.songRecords,
        ratingRange,
        searchText,
        selectedClearStatuses,
        selectedDifficulties,
        selectedRanks,
        uf,
    ]);

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

            <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            label={t("songRecords.filters.search")}
                            value={searchTextDraft}
                            onChange={(event) => setSearchTextDraft(event.target.value)}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={1}>
                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                                <Typography variant="subtitle2">{t("songRecords.filters.ratingRange")}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {ratingRangeDraft[0]} - {ratingRangeDraft[1]}
                                </Typography>
                            </Stack>
                            <Slider
                                value={ratingRangeDraft}
                                min={0}
                                max={400}
                                step={1}
                                onChange={(_, value) => {
                                    if (Array.isArray(value)) {
                                        setRatingRangeDraft(value as [number, number]);
                                    }
                                }}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value}`}
                            />
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Stack spacing={1}>
                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                                <Typography variant="subtitle2">{t("songRecords.filters.achievementRange")}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {achievementRangeDraft[0].toFixed(3)}% - {achievementRangeDraft[1].toFixed(3)}%
                                </Typography>
                            </Stack>
                            <Slider
                                value={achievementRangeDraft}
                                min={0}
                                max={101}
                                step={0.001}
                                onChange={(_, value) => {
                                    if (Array.isArray(value)) {
                                        setAchievementRangeDraft(value as [number, number]);
                                    }
                                }}
                                valueLabelDisplay="auto"
                                valueLabelFormat={(value) => `${value.toFixed(3)}%`}
                            />
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="song-record-rank-label">{t("songRecords.filters.rank")}</InputLabel>
                            <Select
                                labelId="song-record-rank-label"
                                multiple
                                value={selectedRanksDraft}
                                input={<OutlinedInput label={t("songRecords.filters.rank")} />}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setSelectedRanksDraft(
                                        typeof value === "string" ? (value.split(",") as GameRecordScoreRank[]) : value,
                                    );
                                }}
                                renderValue={(selected) =>
                                    selected.length > 0
                                        ? selected.map((rank) => formatRankLabel(rank)).join(", ")
                                        : t("songRecords.filters.all")
                                }
                                displayEmpty
                            >
                                {ranks.map((rank) => (
                                    <MenuItem key={rank} value={rank}>
                                        <Checkbox checked={selectedRanks.includes(rank)} />
                                        <ListItemText primary={formatRankLabel(rank)} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="song-record-clear-label">{t("songRecords.filters.clear")}</InputLabel>
                            <Select
                                labelId="song-record-clear-label"
                                multiple
                                value={selectedClearStatusesDraft}
                                input={<OutlinedInput label={t("songRecords.filters.clear")} />}
                                onChange={(event) => {
                                    const value = event.target.value;
                                    setSelectedClearStatusesDraft(
                                        typeof value === "string" ? (value.split(",") as GameRecordStatus[]) : value,
                                    );
                                }}
                                renderValue={(selected) =>
                                    selected.length > 0
                                        ? selected.map((status) => formatClearLabel(status)).join(", ")
                                        : t("songRecords.filters.all")
                                }
                                displayEmpty
                            >
                                {clearStatuses.map((status) => (
                                    <MenuItem key={status} value={status}>
                                        <Checkbox checked={selectedClearStatuses.includes(status)} />
                                        <ListItemText primary={formatClearLabel(status)} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

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
                                    <SongRecordCardView record={record} onSelect={setSelectedRecord} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <SongRecordsTableView records={visibleRecords} onSelect={setSelectedRecord} />
                    )}
                </>
            )}

            <SongRecordDetailDialogView
                record={selectedRecord}
                open={selectedRecord !== null}
                onClose={handleCloseDetail}
            />
        </Box>
    );
}

export default observer(PageRecordsSongRecord);
