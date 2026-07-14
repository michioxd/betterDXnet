import { apiCollections, type CollectionGeneres, type NameplateAvailableListResponse } from "@/api/collections";
import { rootStore } from "@/stores/root";
import {
    Alert,
    Box,
    Button,
    Card,
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function PageCollectionsNameplate() {
    const { app, me } = rootStore;
    const [genres, setGenres] = useState<CollectionGeneres[]>([]);
    const [nameplates, setNameplates] = useState<NameplateAvailableListResponse[]>([]);
    const [selectedGenreId, setSelectedGenreId] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [favoriteOnly, setFavoriteOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const disposedRef = useRef(false);

    const loadNameplates = useCallback(async (showPageLoading: boolean) => {
        if (showPageLoading) {
            setLoading(true);
        } else {
            setBackgroundLoading(true);
        }
        setError(null);

        try {
            const { genereList, nameplateList } = await apiCollections.nameplate.listAvailable();

            if (disposedRef.current) return;

            setGenres(genereList);
            setNameplates(nameplateList);
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
        void loadNameplates(true);

        return () => {
            disposedRef.current = true;
        };
    }, [loadNameplates]);

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

    const handleSetNameplate = async (nameplate: NameplateAvailableListResponse) => {
        setBackgroundLoading(true);
        setError(null);

        try {
            await apiCollections.nameplate.set(nameplate.formValue, getRequiredUserToken());
            await loadNameplates(false);
            me.refresh();
        } catch (error) {
            setError(error as Error);
            setBackgroundLoading(false);
        }
    };

    const handleToggleFavoriteNameplate = async (nameplate: NameplateAvailableListResponse) => {
        setBackgroundLoading(true);
        setError(null);

        try {
            const token = getRequiredUserToken();

            if (nameplate.favorite) {
                await apiCollections.nameplate.unfavorite(nameplate.formValue, token);
            } else {
                await apiCollections.nameplate.favorite(nameplate.formValue, token);
            }

            await loadNameplates(false);
        } catch (error) {
            setError(error as Error);
            setBackgroundLoading(false);
        }
    };

    const filteredNameplates = useMemo(() => {
        const normalizedSearchText = searchText.trim().toLowerCase();

        return nameplates.filter((nameplate) => {
            const matchesGenre = selectedGenreId === "all" || nameplate.genereId === selectedGenreId;
            const matchesFavorite = !favoriteOnly || nameplate.favorite;
            const matchesText =
                normalizedSearchText.length === 0 ||
                nameplate.title.toLowerCase().includes(normalizedSearchText) ||
                nameplate.description.toLowerCase().includes(normalizedSearchText);

            return matchesGenre && matchesFavorite && matchesText;
        });
    }, [favoriteOnly, nameplates, searchText, selectedGenreId]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5">Collections / Nameplate</Typography>
                <Typography color="textSecondary">Change nameplates for your profile.</Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth>
                    <InputLabel id="nameplate-genre-filter-label">Genre</InputLabel>
                    <Select
                        labelId="nameplate-genre-filter-label"
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

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error">{error.message}</Alert>}

            {!loading && !error && (
                <>
                    <Typography color="textSecondary">
                        Showing {filteredNameplates.length} of {nameplates.length} nameplates
                    </Typography>

                    <Grid container spacing={2}>
                        {filteredNameplates.map((nameplate) => (
                            <Grid
                                key={`${nameplate.genereId}-${nameplate.formValue}-${nameplate.title}`}
                                size={{ xs: 12, sm: 12, md: 6, lg: 4 }}
                            >
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: "100%",
                                        opacity: nameplate.available ? 1 : 0.55,
                                        borderColor: nameplate.using ? "primary.main" : undefined,
                                    }}
                                >
                                    <CardContent>
                                        <CardMedia
                                            component="img"
                                            image={nameplate.url}
                                            alt={nameplate.title}
                                            sx={{ width: "100%", height: 80, objectFit: "contain", mb: 2 }}
                                        />
                                        <Typography variant="subtitle1" noWrap title={nameplate.title}>
                                            {nameplate.title || "Untitled"}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            noWrap
                                            title={nameplate.description}
                                        >
                                            {nameplate.description || "No description"}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                                            <Chip size="small" label={nameplate.genereName} />
                                            {nameplate.using && <Chip size="small" color="primary" label="In-use" />}
                                            {nameplate.favorite && <Chip size="small" color="error" label="Favorite" />}
                                            {!nameplate.available && (
                                                <Chip size="small" color="default" label="Locked" />
                                            )}
                                        </Stack>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                                        <Button
                                            size="small"
                                            startIcon={nameplate.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                            disabled={!nameplate.available || backgroundLoading}
                                            onClick={() => void handleToggleFavoriteNameplate(nameplate)}
                                        >
                                            {nameplate.favorite ? "Unfavorite" : "Favorite"}
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<CheckCircleIcon />}
                                            disabled={!nameplate.available || nameplate.using || backgroundLoading}
                                            onClick={() => void handleSetNameplate(nameplate)}
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

export default PageCollectionsNameplate;
