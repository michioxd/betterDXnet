import { apiCollections, type CollectionGeneres, type IconAvailableListResponse } from "@/api/collections";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function PageCollectionsIcon() {
    const { app, me } = rootStore;
    const [genres, setGenres] = useState<CollectionGeneres[]>([]);
    const [icons, setIcons] = useState<IconAvailableListResponse[]>([]);
    const [randomFormValue, setRandomFormValue] = useState<{ all?: string; favorite?: string }>({});
    const [selectedGenreId, setSelectedGenreId] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [favoriteOnly, setFavoriteOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const disposedRef = useRef(false);

    const loadIcons = useCallback(async (showPageLoading: boolean) => {
        if (showPageLoading) {
            setLoading(true);
        } else {
            setBackgroundLoading(true);
        }
        setError(null);

        try {
            const { genereList, iconList, randomFormValue } = await apiCollections.icon.listAvailable();

            if (disposedRef.current) return;

            setGenres(genereList);
            setIcons(iconList);
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
        void loadIcons(true);

        return () => {
            disposedRef.current = true;
        };
    }, [loadIcons]);

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

    const handleSetIcon = async (formValue: string) => {
        setBackgroundLoading(true);
        setError(null);

        try {
            await apiCollections.icon.set(formValue, getRequiredUserToken());
            await loadIcons(false);
            me.refresh();
        } catch (error) {
            setError(error as Error);
            setBackgroundLoading(false);
        }
    };

    const handleToggleFavoriteIcon = async (icon: IconAvailableListResponse) => {
        setBackgroundLoading(true);
        setError(null);

        console.log("Toggling favorite for icon:", icon);

        try {
            const token = getRequiredUserToken();

            if (icon.favorite) {
                await apiCollections.icon.unfavorite(icon.formValue, token);
            } else {
                await apiCollections.icon.favorite(icon.formValue, token);
            }

            await loadIcons(false);
        } catch (error) {
            setError(error as Error);
            setBackgroundLoading(false);
        }
    };

    const filteredIcons = useMemo(() => {
        const normalizedSearchText = searchText.trim().toLowerCase();

        return icons.filter((icon) => {
            const matchesGenre = selectedGenreId === "all" || icon.genereId === selectedGenreId;
            const matchesFavorite = !favoriteOnly || icon.favorite;
            const matchesText =
                normalizedSearchText.length === 0 ||
                icon.title.toLowerCase().includes(normalizedSearchText) ||
                icon.description.toLowerCase().includes(normalizedSearchText);

            return matchesGenre && matchesFavorite && matchesText;
        });
    }, [favoriteOnly, icons, searchText, selectedGenreId]);

    const canFavoriteIcon = (icon: IconAvailableListResponse) => icon.genereId !== "1" || icon.title !== "USER ICON";
    const randomOptions = [
        {
            key: "all",
            title: "Random selection from all",
            description: "Randomly selected from all collections for each play!",
            formValue: randomFormValue.all,
            active: me.me?.collections.icon.isRandomFromAll ?? false,
        },
        {
            key: "favorite",
            title: "Random selection from favorite",
            description: "Randomly selected from favorite collections for each play!",
            formValue: randomFormValue.favorite,
            active: me.me?.collections.icon.isRandomFromFavorite ?? false,
        },
    ];

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            <Box>
                <Typography variant="h5">Collections / Icon</Typography>
                <Typography color="textSecondary">Change icons for your profile.</Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth>
                    <InputLabel id="icon-genre-filter-label">Genre</InputLabel>
                    <Select
                        labelId="icon-genre-filter-label"
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
                            key={option.key}
                            variant="outlined"
                            sx={{ borderColor: option.active ? "primary.main" : undefined }}
                        >
                            <CardActionArea
                                disabled={!option.formValue || option.active || backgroundLoading}
                                data-active={option.active ? "" : undefined}
                                onClick={() => option.formValue && void handleSetIcon(option.formValue)}
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
                        Showing {filteredIcons.length} of {icons.length} icons
                    </Typography>

                    <Grid container spacing={2}>
                        {filteredIcons.map((icon) => (
                            <Grid
                                key={`${icon.genereId}-${icon.formValue}-${icon.title}`}
                                size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}
                            >
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: "100%",
                                        opacity: icon.available ? 1 : 0.55,
                                        borderColor: icon.using ? "primary.main" : undefined,
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                            <CardMedia
                                                component="img"
                                                image={icon.url}
                                                alt={icon.title}
                                                sx={{ width: 80, height: 80, objectFit: "contain", flexShrink: 0 }}
                                            />
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="subtitle1" noWrap title={icon.title}>
                                                    {icon.title || "Untitled"}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="textSecondary"
                                                    noWrap
                                                    title={icon.description}
                                                >
                                                    {icon.description || "No description"}
                                                </Typography>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}
                                                >
                                                    <Chip size="small" label={icon.genereName} />
                                                    {icon.using && <Chip size="small" color="primary" label="In-use" />}
                                                    {!icon.available && (
                                                        <Chip size="small" color="default" label="Locked" />
                                                    )}
                                                </Stack>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                                        {canFavoriteIcon(icon) && (
                                            <Button
                                                size="small"
                                                startIcon={icon.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                                disabled={!icon.available || backgroundLoading}
                                                onClick={() => void handleToggleFavoriteIcon(icon)}
                                            >
                                                {icon.favorite ? "Unfavorite" : "Favorite"}
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<CheckCircleIcon />}
                                            disabled={!icon.available || icon.using || backgroundLoading}
                                            onClick={() => void handleSetIcon(icon.formValue)}
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

export default PageCollectionsIcon;
