import { apiPlayer, type GetPlayerFavoriteSong } from "@/api/player";
import ImgLazyload from "@/components/Img.Lazyload";
import { dataSource } from "@/db/maimaiDataTypes";
import { rootStore } from "@/stores/root";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const MAX_FAVORITE_SONGS = 30;
const ROW_HEIGHT = 88;
const OVERSCAN = 8;
const ALL_CATEGORIES = "__all__";

type FavoriteSongRowProps = {
    song: GetPlayerFavoriteSong;
    checked: boolean;
    disabled: boolean;
    onToggle: (value: string) => void;
};

function normalizeSearchText(value: string) {
    return value.toLowerCase().normalize("NFKC");
}

function FavoriteSongRowImpl({ song, checked, disabled, onToggle }: FavoriteSongRowProps) {
    const artist = song.songFullDetail?.artist;
    const artworkUrl = song.songFullDetail ? dataSource.getSongArtworkUrl(song.songFullDetail) : "";

    return (
        <Card
            sx={{
                p: 0,
                height: ROW_HEIGHT,
                border: "none",
                borderBottom: 1,
                borderRight: 1,
                borderColor: "divider",
                borderRadius: 0,
                opacity: disabled ? 0.55 : 1,
                bgcolor: checked ? "action.selected" : "background.paper",
                transition: "background-color 0.2s, opacity 0.2s",
            }}
            variant="outlined"
        >
            <CardActionArea sx={{ height: "100%" }} onClick={() => onToggle(song.value)}>
                <CardContent
                    sx={{
                        p: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        height: "100%",
                    }}
                >
                    <Checkbox checked={checked} disabled={disabled} onChange={() => onToggle(song.value)} />

                    {song.songFullDetail && (
                        <ImgLazyload
                            src={artworkUrl}
                            alt=""
                            sx={{
                                width: 64,
                                height: 64,
                                flexShrink: 0,
                                borderRadius: 1,
                                objectFit: "cover",
                                bgcolor: "action.hover",
                                mr: 1.5,
                            }}
                        />
                    )}

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" noWrap title={song.songTitle}>
                            {song.songTitle}
                        </Typography>
                        {artist && (
                            <Typography
                                variant="body2"
                                color="textSecondary"
                                noWrap
                                title={artist}
                                sx={{ fontSize: "0.75rem" }}
                            >
                                {artist}
                            </Typography>
                        )}
                        {song.songFullDetail?.category && (
                            <Chip
                                size="small"
                                label={song.songFullDetail.category}
                                sx={{ mt: 0.5, maxWidth: "100%" }}
                            />
                        )}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

const FavoriteSongRow = memo(FavoriteSongRowImpl);

function PageSettingsFavoriteSongs() {
    const { t } = useTranslation("settings");
    const { app, me } = rootStore;
    const isTwoColumn = useMediaQuery("(min-width:900px)");
    const listRef = useRef<HTMLDivElement | null>(null);
    const [songs, setSongs] = useState<GetPlayerFavoriteSong[]>([]);
    const [selectedValues, setSelectedValues] = useState<Set<string>>(new Set());
    const [initialSelectedValues, setInitialSelectedValues] = useState<Set<string>>(new Set());
    const [category, setCategory] = useState(ALL_CATEGORIES);
    const [selectedOnly, setSelectedOnly] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [scrollTop, setScrollTop] = useState(0);
    const [listHeight, setListHeight] = useState(640);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        app.setGlobalLoading(loading || saving);
    }, [app, loading, saving]);

    useEffect(() => {
        const list = listRef.current;

        if (!list || !("ResizeObserver" in window)) return;

        const observer = new ResizeObserver(([entry]) => {
            setListHeight(entry.contentRect.height);
        });

        observer.observe(list);

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => window.clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        let disposed = false;

        const loadFavoriteSongs = async () => {
            setLoading(true);
            setError(null);

            try {
                const favoriteSongs = await apiPlayer.favorite();

                if (disposed) return;

                const selected = new Set(favoriteSongs.filter((song) => song.selected).map((song) => song.value));
                setSongs(favoriteSongs);
                setSelectedValues(selected);
                setInitialSelectedValues(new Set(selected));
            } catch (error) {
                if (disposed) return;

                setError(error as Error);
            } finally {
                if (disposed) return;

                setLoading(false);
            }
        };

        void loadFavoriteSongs();

        return () => {
            disposed = true;
        };
    }, []);

    const categories = useMemo(() => {
        const categorySet = new Set<string>();

        songs.forEach((song) => {
            if (song.songFullDetail?.category) {
                categorySet.add(song.songFullDetail.category);
            }
        });

        return [...categorySet].sort((a, b) => a.localeCompare(b));
    }, [songs]);

    const filteredSongs = useMemo(() => {
        const query = normalizeSearchText(debouncedSearch.trim());

        return songs.filter((song) => {
            if (selectedOnly && !selectedValues.has(song.value)) return false;
            if (category !== ALL_CATEGORIES && song.songFullDetail?.category !== category) return false;
            if (!query) return true;

            const title = normalizeSearchText(song.songTitle);
            const artist = normalizeSearchText(song.songFullDetail?.artist ?? "");

            return title.includes(query) || artist.includes(query);
        });
    }, [category, debouncedSearch, selectedOnly, selectedValues, songs]);

    const selectedCount = selectedValues.size;
    const hasChanges = useMemo(() => {
        if (selectedValues.size !== initialSelectedValues.size) return true;

        for (const value of selectedValues) {
            if (!initialSelectedValues.has(value)) return true;
        }

        return false;
    }, [initialSelectedValues, selectedValues]);

    const columnCount = isTwoColumn ? 2 : 1;
    const totalRows = Math.ceil(filteredSongs.length / columnCount);

    const visibleRange = useMemo(() => {
        const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
        const end = Math.min(totalRows, Math.ceil((scrollTop + listHeight) / ROW_HEIGHT) + OVERSCAN);

        return { start, end };
    }, [listHeight, scrollTop, totalRows]);

    const visibleSongs = filteredSongs.slice(visibleRange.start * columnCount, visibleRange.end * columnCount);

    const handleToggleSong = useCallback((value: string) => {
        setSelectedValues((currentValues) => {
            const nextValues = new Set(currentValues);

            if (nextValues.has(value)) {
                nextValues.delete(value);
            } else if (nextValues.size < MAX_FAVORITE_SONGS) {
                nextValues.add(value);
            }

            return nextValues;
        });
    }, []);

    const handleDeselectAll = () => {
        setSelectedValues(new Set());
    };

    const handleReset = () => {
        setSelectedValues(new Set(initialSelectedValues));
    };

    const getRequiredUserToken = async () => {
        const token = await me.getUserToken();

        if (!token) {
            throw new Error(t("common.userTokenNotFound"));
        }

        return token;
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await apiPlayer.setFavorite([...selectedValues], await getRequiredUserToken());
            setInitialSelectedValues(new Set(selectedValues));
            setSuccessMessage(t("favoriteSongs.updated"));
        } catch (error) {
            setError(error as Error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5">{t("favoriteSongs.title")}</Typography>
                <Typography color="textSecondary">{t("favoriteSongs.description")}</Typography>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    action={
                        <IconButton color="inherit">
                            <CloseIcon fontSize="small" onClick={() => setError(null)} />
                        </IconButton>
                    }
                >
                    {error.message}
                </Alert>
            )}
            {successMessage && (
                <Alert
                    severity="success"
                    action={
                        <IconButton color="inherit">
                            <CloseIcon fontSize="small" onClick={() => setSuccessMessage(null)} />
                        </IconButton>
                    }
                >
                    {successMessage}
                </Alert>
            )}
            {selectedCount >= MAX_FAVORITE_SONGS && (
                <Alert severity="info">{t("favoriteSongs.maxSelected", { max: MAX_FAVORITE_SONGS })}</Alert>
            )}

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <TextField
                                fullWidth
                                label={t("favoriteSongs.search")}
                                value={search}
                                disabled={loading}
                                onChange={(event) => setSearch(event.target.value)}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <FormControl sx={{ minWidth: { xs: "100%", md: 240 } }} disabled={loading}>
                                <InputLabel id="favorite-song-category-label">{t("favoriteSongs.category")}</InputLabel>
                                <Select
                                    labelId="favorite-song-category-label"
                                    label={t("favoriteSongs.category")}
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value)}
                                >
                                    <MenuItem value={ALL_CATEGORIES}>{t("favoriteSongs.allCategories")}</MenuItem>
                                    {categories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
                        >
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <FavoriteIcon color="error" />
                                <Typography variant="body2">
                                    {t("favoriteSongs.selectedCount", {
                                        count: selectedCount,
                                        max: MAX_FAVORITE_SONGS,
                                    })}
                                </Typography>
                                <Switch
                                    checked={selectedOnly}
                                    disabled={loading}
                                    onChange={(event) => setSelectedOnly(event.target.checked)}
                                />
                                <Typography variant="body2">{t("favoriteSongs.selectedOnly")}</Typography>
                            </Stack>

                            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                                <Button disabled={loading || saving || selectedCount === 0} onClick={handleDeselectAll}>
                                    {t("favoriteSongs.deselectAll")}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<RestartAltIcon />}
                                    disabled={loading || saving || !hasChanges}
                                    onClick={handleReset}
                                >
                                    {t("common.reset")}
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={
                                        saving ? <CircularProgress color="inherit" size={16} /> : <CheckCircleIcon />
                                    }
                                    disabled={loading || saving || !hasChanges || selectedCount > MAX_FAVORITE_SONGS}
                                    onClick={handleSave}
                                >
                                    {t("common.save")}
                                </Button>
                            </Stack>
                        </Stack>

                        <Typography variant="body2" color="textSecondary">
                            {t("favoriteSongs.resultCount", { count: filteredSongs.length, total: songs.length })}
                        </Typography>

                        <Box
                            ref={listRef}
                            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
                            sx={{
                                height: "65vh",
                                overflow: "auto",
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 1,
                                bgcolor: "background.paper",
                            }}
                        >
                            {loading ? (
                                <Stack
                                    spacing={1}
                                    sx={{ alignItems: "center", justifyContent: "center", height: "100%" }}
                                >
                                    <CircularProgress />
                                    <Typography color="textSecondary">{t("favoriteSongs.loading")}</Typography>
                                </Stack>
                            ) : filteredSongs.length === 0 ? (
                                <Stack sx={{ alignItems: "center", justifyContent: "center", height: "100%" }}>
                                    <Typography color="textSecondary">{t("favoriteSongs.empty")}</Typography>
                                </Stack>
                            ) : (
                                <Box sx={{ height: totalRows * ROW_HEIGHT, position: "relative" }}>
                                    <Box
                                        sx={{
                                            transform: `translateY(${visibleRange.start * ROW_HEIGHT}px)`,
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            display: "grid",
                                            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                                        }}
                                    >
                                        {visibleSongs.map((song) => {
                                            const checked = selectedValues.has(song.value);

                                            return (
                                                <FavoriteSongRow
                                                    key={song.value}
                                                    song={song}
                                                    checked={checked}
                                                    disabled={
                                                        saving || (!checked && selectedCount >= MAX_FAVORITE_SONGS)
                                                    }
                                                    onToggle={handleToggleSong}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

export default PageSettingsFavoriteSongs;
