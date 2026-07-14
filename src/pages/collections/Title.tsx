import { apiCollections, TrophyType, trophyBgBasePath, type TitleAvailableListResponse } from "@/api/collections";
import { rootStore } from "@/stores/root";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardActions,
    CardContent,
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

const trophyTypes = Object.values(TrophyType);

function getTrophyBg(type: TrophyType) {
    return trophyBgBasePath.replace("{}", type.toLowerCase());
}

function PageCollectionsTitle() {
    const { t } = useTranslation("collections");
    const { app, me } = rootStore;
    const [selectedType, setSelectedType] = useState<TrophyType>(TrophyType.Normal);
    const [titles, setTitles] = useState<TitleAvailableListResponse[]>([]);
    const [randomFormValue, setRandomFormValue] = useState<{ all?: string; favorite?: string }>({});
    const [searchText, setSearchText] = useState("");
    const [favoriteOnly, setFavoriteOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [backgroundLoading, setBackgroundLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const disposedRef = useRef(false);

    const loadTitles = useCallback(async (showPageLoading: boolean, type: TrophyType) => {
        if (showPageLoading) {
            setLoading(true);
        } else {
            setBackgroundLoading(true);
        }
        setError(null);

        try {
            const titleResponse = await apiCollections.title.listAvailable(type);
            const titleList = Array.isArray(titleResponse) ? titleResponse : titleResponse.titleList;
            const randomFormValue = Array.isArray(titleResponse) ? {} : (titleResponse.randomFormValue ?? {});

            if (disposedRef.current) return;

            setTitles(titleList ?? []);
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
        void loadTitles(true, selectedType);

        return () => {
            disposedRef.current = true;
        };
    }, [loadTitles, selectedType]);

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

    const handleSetTitle = async (formValue: string) => {
        setBackgroundLoading(true);
        setError(null);

        try {
            await apiCollections.title.set(formValue, getRequiredUserToken());
            await loadTitles(false, selectedType);
            me.refresh();
        } catch (error) {
            setError(error as Error);
            setBackgroundLoading(false);
        }
    };

    const handleToggleFavoriteTitle = async (title: TitleAvailableListResponse) => {
        setBackgroundLoading(true);
        setError(null);

        try {
            const token = getRequiredUserToken();

            if (title.favorite) {
                await apiCollections.title.unfavorite(title.formValue, token);
            } else {
                await apiCollections.title.favorite(title.formValue, token);
            }

            await loadTitles(false, selectedType);
        } catch (error) {
            setError(error as Error);
            setBackgroundLoading(false);
        }
    };

    const filteredTitles = useMemo(() => {
        const normalizedSearchText = searchText.trim().toLowerCase();

        return titles.filter((title) => {
            const matchesFavorite = !favoriteOnly || title.favorite;
            const matchesText =
                normalizedSearchText.length === 0 ||
                title.title.toLowerCase().includes(normalizedSearchText) ||
                title.description.toLowerCase().includes(normalizedSearchText);

            return matchesFavorite && matchesText;
        });
    }, [favoriteOnly, searchText, titles]);

    const hasFavoriteTitle = titles.some((title) => title.favorite);
    const randomOptions = [
        {
            key: "all",
            title: t("common.randomFromAll"),
            description: t("common.randomFromAllDescription"),
            formValue: randomFormValue?.all,
            active: me.me?.collections.title.isRandomFromAll ?? false,
        },
        {
            key: "favorite",
            title: t("common.randomFromFavorite"),
            description: t("common.randomFromFavoriteDescription"),
            formValue: randomFormValue?.favorite,
            active: me.me?.collections.title.isRandomFromFavorite ?? false,
            disabled: !hasFavoriteTitle,
        },
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5">{t("title.title")}</Typography>
                <Typography color="textSecondary">{t("title.description")}</Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl fullWidth>
                    <InputLabel id="title-type-filter-label">{t("common.type")}</InputLabel>
                    <Select
                        labelId="title-type-filter-label"
                        label={t("common.type")}
                        value={selectedType}
                        onChange={(event) => setSelectedType(event.target.value as TrophyType)}
                    >
                        {trophyTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
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
                                onClick={() => option.formValue && void handleSetTitle(option.formValue)}
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
                            shown: filteredTitles.length,
                            total: titles.length,
                            itemName: t("title.itemName"),
                        })}
                    </Typography>

                    <Grid container spacing={2}>
                        {filteredTitles.map((title) => (
                            <Grid
                                key={`${title.type}-${title.formValue}-${title.title}`}
                                size={{ xs: 12, sm: 12, md: 6, lg: 4 }}
                            >
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: "100%",
                                        opacity: title.available ? 1 : 0.55,
                                        borderColor: title.using ? "primary.main" : undefined,
                                    }}
                                >
                                    <CardContent>
                                        <Box
                                            sx={{
                                                backgroundImage: `url(${getTrophyBg(title.type)})`,
                                                backgroundRepeat: "no-repeat",
                                                backgroundSize: "100% 100%",
                                                minHeight: 42,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                px: 2,
                                                mb: 2,
                                                color: " #fff",
                                                textShadow:
                                                    "black 1px 1px 0, black -1px -1px 0, black -1px 1px 0, black 1px -1px 0, black 0px 1px 0, black 0 -1px 0, black -1px 0 0, black 1px 0 0;",
                                            }}
                                        >
                                            <Typography variant="subtitle1" noWrap title={title.title}>
                                                {title.title || t("common.untitled")}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            color="textSecondary"
                                            noWrap
                                            title={title.description}
                                        >
                                            {title.description || t("common.noDescription")}
                                        </Typography>
                                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                                            <Chip size="small" label={title.type} />
                                            {title.using && (
                                                <Chip size="small" color="primary" label={t("common.inUse")} />
                                            )}
                                            {title.favorite && (
                                                <Chip size="small" color="error" label={t("common.favorite")} />
                                            )}
                                            {!title.available && (
                                                <Chip size="small" color="default" label={t("common.locked")} />
                                            )}
                                        </Stack>
                                    </CardContent>
                                    <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                                        <Button
                                            size="small"
                                            startIcon={title.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                            disabled={!title.available || backgroundLoading}
                                            onClick={() => void handleToggleFavoriteTitle(title)}
                                        >
                                            {title.favorite ? t("common.unfavorite") : t("common.favorite")}
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<CheckCircleIcon />}
                                            disabled={!title.available || title.using || backgroundLoading}
                                            onClick={() => void handleSetTitle(title.formValue)}
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

export default observer(PageCollectionsTitle);
