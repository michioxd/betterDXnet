import { apiCollections, type CollectionGeneres, type FrameAvailableListResponse } from "@/api/collections";
import { rootStore } from "@/stores/root";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardMedia,
    Checkbox,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function PageCollectionsFrame() {
    const { app, me } = rootStore;
    const [genres, setGenres] = useState<CollectionGeneres[]>([]);
    const [frames, setFrames] = useState<FrameAvailableListResponse[]>([]);
    const [randomFormValue, setRandomFormValue] = useState<{ all?: string; favorite?: string }>({});
    const [selectedGenreId, setSelectedGenreId] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [favoriteOnly, setFavoriteOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const disposedRef = useRef(false);

    const loadFrames = useCallback(async (showPageLoading: boolean) => {
        if (showPageLoading) {
            setLoading(true);
        } else {
            setBackgroundLoading(true);
        }
        setError(null);

        try {
            const { genereList, frameList, randomFormValue = {} } = await apiCollections.frame.listAvailable();

            if (disposedRef.current) return;

            setGenres(genereList);
            setFrames(frameList);
            setRandomFormValue(randomFormValue);
        } catch (error) {
            if (disposedRef.current) return;

            setError(error as Error);
        } finally {
            if (disposedRef.current) return;

            if (showPageLoading) {
                setLoading(false);
            } else {
                setBackgroundLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        disposedRef.current = false;
        void loadFrames(true);

        return () => {
            disposedRef.current = true;
        };
    }, [loadFrames]);

    useEffect(() => {
        if (loading || backgroundLoading) app.setGlobalLoading(true);
        else app.setGlobalLoading(false);
    }, [loading, backgroundLoading, app]);

    const getRequiredUserToken = () => {
        const token = me.getUserToken();

        if (!token) {
            throw new Error("User token not found");
        }

        return token;
    };

    const handleSetFrame = async (formValue: string) => {
        setBackgroundLoading(true);
        setError(null);

        try {
            await apiCollections.frame.set(formValue, getRequiredUserToken());
            await loadFrames(false);
            me.refresh();
        } catch (error) {
            setError(error as Error);
            setBackgroundLoading(false);
        }
    };

    const handleToggleFavoriteFrame = async (frame: FrameAvailableListResponse) => {
        setBackgroundLoading(true);
        setError(null);

        try {
            const token = getRequiredUserToken();

            if (frame.favorite) {
                await apiCollections.frame.unfavorite(frame.formValue, token);
            } else {
                await apiCollections.frame.favorite(frame.formValue, token);
            }

            await loadFrames(false);
        } catch (error) {
            setError(error as Error);
            setBackgroundLoading(false);
        }
    };

    const filteredFrames = useMemo(() => {
        const normalizedSearchText = searchText.trim().toLowerCase();

        return frames.filter((frame) => {
            const matchesGenre = selectedGenreId === "all" || frame.genereId === selectedGenreId;
            const matchesFavorite = !favoriteOnly || frame.favorite;
            const matchesText =
                normalizedSearchText.length === 0 ||
                frame.title.toLowerCase().includes(normalizedSearchText) ||
                frame.description.toLowerCase().includes(normalizedSearchText);

            return matchesGenre && matchesFavorite && matchesText;
        });
    }, [favoriteOnly, frames, searchText, selectedGenreId]);

    const hasFavoriteFrame = frames.some((frame) => frame.favorite);
    const randomOptions = [
        {
            key: "all",
            title: "Random selection from all",
            description: "Randomly selected from all collections for each play!",
            formValue: randomFormValue?.all,
            active: me.me?.collections.frame.isRandomFromAll ?? false,
        },
        {
            key: "favorite",
            title: "Random selection from favorite",
            description: "Randomly selected from favorite collections for each play!",
            formValue: randomFormValue?.favorite,
            active: me.me?.collections.frame.isRandomFromFavorite ?? false,
            disabled: !hasFavoriteFrame,
        },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5">Collections / Frame</Typography>
                <Typography color="textSecondary">Change frames for your profile.</Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth>
                    <InputLabel id="frame-genre-filter-label">Genre</InputLabel>
                    <Select
                        labelId="frame-genre-filter-label"
                        label="Genre"
                        value={selectedGenreId}
                        onChange={(event) => setSelectedGenreId(event.target.value)}
                    >
                        <MenuItem value="all">All genres</MenuItem>
                        {genres.map((genre) => (
                            <MenuItem key={genre.id} value={genre.id}>
                                {genre.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    label="Search"
                    placeholder="Filter by title or description"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                />

                <FormControlLabel
                    sx={{ flexShrink: 0 }}
                    control={
                        <Checkbox checked={favoriteOnly} onChange={(event) => setFavoriteOnly(event.target.checked)} />
                    }
                    label="Favorite only"
                />
            </Stack>

            <Grid container spacing={2}>
                {randomOptions.map((option) => (
                    <Grid key={option.key} size={{ xs: 12, sm: 6 }}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderColor: option.active ? "primary.main" : undefined,
                                opacity: option.disabled ? 0.55 : 1,
                            }}
                        >
                            <CardActionArea
                                disabled={option.disabled || !option.formValue || option.active || backgroundLoading}
                                data-active={option.active ? "" : undefined}
                                onClick={() => option.formValue && void handleSetFrame(option.formValue)}
                                sx={{
                                    height: "100%",
                                    "&[data-active]": {
                                        backgroundColor: "action.selected",
                                        "&:hover": {
                                            backgroundColor: "action.selectedHover",
                                        },
                                    },
                                }}
                            >
                                <CardContent sx={{ height: "100%" }}>
                                    <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
                                        <Typography variant="body1" component="div">
                                            {option.title}
                                        </Typography>
                                        {option.active && <Chip size="small" color="primary" label="In-use" />}
                                    </Stack>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {option.description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error">{error.message}</Alert>}

            {!loading && !error && (
                <>
                    <Typography color="textSecondary">
                        Showing {filteredFrames.length} of {frames.length} frames
                    </Typography>

                    <Grid container spacing={2}>
                        {filteredFrames.map((frame) => (
                            <Grid
                                key={`${frame.genereId}-${frame.formValue}-${frame.title}`}
                                size={{ xs: 12, sm: 12, md: 6, lg: 4 }}
                            >
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: "100%",
                                        opacity: frame.available ? 1 : 0.55,
                                        borderColor: frame.using ? "primary.main" : undefined,
                                    }}
                                >
                                    <CardContent>
                                        <CardMedia
                                            component="img"
                                            image={frame.url}
                                            alt={frame.title}
                                            sx={{
                                                width: "100%",
                                                objectFit: "contain",
                                                mb: 2,
                                                aspectRatio: 396 / 165,
                                                backgroundColor: "rgba(128,128,128,0.1)",
                                            }}
                                        />
                                        <Typography variant="subtitle1" noWrap title={frame.title}>
                                            {frame.title || "Untitled"}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            noWrap
                                            title={frame.description}
                                        >
                                            {frame.description || "No description"}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                                            <Chip size="small" label={frame.genereName} />
                                            {frame.using && <Chip size="small" color="primary" label="In-use" />}
                                            {frame.favorite && <Chip size="small" color="error" label="Favorite" />}
                                            {!frame.available && <Chip size="small" color="default" label="Locked" />}
                                        </Stack>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                                        <Button
                                            size="small"
                                            startIcon={frame.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                            disabled={!frame.available || backgroundLoading}
                                            onClick={() => void handleToggleFavoriteFrame(frame)}
                                        >
                                            {frame.favorite ? "Unfavorite" : "Favorite"}
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<CheckCircleIcon />}
                                            disabled={!frame.available || frame.using || backgroundLoading}
                                            onClick={() => void handleSetFrame(frame.formValue)}
                                        >
                                            Set
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}
        </Box>
    );
}

export default observer(PageCollectionsFrame);
