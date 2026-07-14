import { apiCollections, type CollectionGeneres, type NameplateAvailableListResponse } from "@/api/collections";
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
import { useTranslation } from "react-i18next";

function PageCollectionsNameplate() {
    const { t } = useTranslation("collections");
    const { app, me } = rootStore;
    const [genres, setGenres] = useState<CollectionGeneres[]>([]);
    const [nameplates, setNameplates] = useState<NameplateAvailableListResponse[]>([]);
    const [randomFormValue, setRandomFormValue] = useState<{ all?: string; favorite?: string }>({});
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
            const { genereList, nameplateList, randomFormValue = {} } = await apiCollections.nameplate.listAvailable();

            if (disposedRef.current) return;

            setGenres(genereList);
            setNameplates(nameplateList);
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
            throw new Error(t("common.userTokenNotFound"));
        }

        return token;
    };

    const handleSetNameplate = async (formValue: string) => {
        setBackgroundLoading(true);
        setError(null);

        try {
            await apiCollections.nameplate.set(formValue, getRequiredUserToken());
            await loadNameplates(false);
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

    const hasFavoriteNameplate = nameplates.some((nameplate) => nameplate.favorite);
    const randomOptions = [
        {
            key: "all",
            title: t("common.randomFromAll"),
            description: t("common.randomFromAllDescription"),
            formValue: randomFormValue?.all,
            active: me.me?.collections.nameplate.isRandomFromAll ?? false,
        },
        {
            key: "favorite",
            title: t("common.randomFromFavorite"),
            description: t("common.randomFromFavoriteDescription"),
            formValue: randomFormValue?.favorite,
            active: me.me?.collections.nameplate.isRandomFromFavorite ?? false,
            disabled: !hasFavoriteNameplate,
        },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5">{t("nameplate.title")}</Typography>
                <Typography color="textSecondary">{t("nameplate.description")}</Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth>
                    <InputLabel id="nameplate-genre-filter-label">{t("common.genre")}</InputLabel>
                    <Select
                        labelId="nameplate-genre-filter-label"
                        label={t("common.genre")}
                        value={selectedGenreId}
                        onChange={(event) => setSelectedGenreId(event.target.value)}
                    >
                        <MenuItem value="all">{t("common.allGenres")}</MenuItem>
                        {genres.map((genre) => (
                            <MenuItem key={genre.id} value={genre.id}>
                                {genre.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    fullWidth
                    label={t("common.search")}
                    placeholder={t("common.filterPlaceholder")}
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                />

                <FormControlLabel
                    sx={{ flexShrink: 0 }}
                    control={
                        <Checkbox checked={favoriteOnly} onChange={(event) => setFavoriteOnly(event.target.checked)} />
                    }
                    label={t("common.favoriteOnly")}
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
                                onClick={() => option.formValue && void handleSetNameplate(option.formValue)}
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
                                        {option.active && (
                                            <Chip size="small" color="primary" label={t("common.inUse")} />
                                        )}
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
                        {t("common.showing", {
                            shown: filteredNameplates.length,
                            total: nameplates.length,
                            itemName: t("nameplate.itemName"),
                        })}
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
                                            {nameplate.title || t("common.untitled")}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            noWrap
                                            title={nameplate.description}
                                        >
                                            {nameplate.description || t("common.noDescription")}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                                            <Chip size="small" label={nameplate.genereName} />
                                            {nameplate.using && (
                                                <Chip size="small" color="primary" label={t("common.inUse")} />
                                            )}
                                            {nameplate.favorite && (
                                                <Chip size="small" color="error" label={t("common.favorite")} />
                                            )}
                                            {!nameplate.available && (
                                                <Chip size="small" color="default" label={t("common.locked")} />
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
                                            {nameplate.favorite ? t("common.unfavorite") : t("common.favorite")}
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<CheckCircleIcon />}
                                            disabled={!nameplate.available || nameplate.using || backgroundLoading}
                                            onClick={() => void handleSetNameplate(nameplate.formValue)}
                                        >
                                            {t("common.set")}
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

export default observer(PageCollectionsNameplate);
