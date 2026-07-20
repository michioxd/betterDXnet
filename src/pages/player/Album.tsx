import { difficultyColor } from "@/api/records";
import type { GetPlayerAlbum } from "@/api/player";
import ImageViewer from "@/components/ImageViewer";
import { rootStore } from "@/stores/root";
import ClockIcon from "@mui/icons-material/AccessTime";
import LocationIcon from "@mui/icons-material/LocationOn";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Grid,
    Link,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { songKindBaseImg } from "@/api/records/types";

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
});

const fullDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "long",
});

function formatDate(value: Date, isFull = false) {
    if (Number.isNaN(value.getTime())) {
        return "-";
    }

    if (isFull) {
        return fullDateTimeFormatter.format(value);
    }

    return dateTimeFormatter.format(value);
}

function AlbumCard({
    photo,
    onViewImage,
}: {
    photo: GetPlayerAlbum;
    onViewImage: (photo: GetPlayerAlbum, sourceRect: DOMRect) => void;
}) {
    const { t } = useTranslation("player");
    const color = difficultyColor[photo.songdifficulty];

    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderColor: color,
                bgcolor: `color-mix(in srgb, ${color} 5%, transparent)`,
            }}
        >
            <Box
                sx={{ position: "relative", cursor: "zoom-in" }}
                onClick={(event) => onViewImage(photo, event.currentTarget.getBoundingClientRect())}
            >
                <CardMedia
                    component="img"
                    image={photo.imageUrl}
                    alt={photo.songTitle}
                    sx={{ aspectRatio: "16 / 9", objectFit: "cover", bgcolor: "action.hover" }}
                />
                <img
                    src={songKindBaseImg.replace("{}", photo.songKind)}
                    alt={photo.songKind}
                    style={{ position: "absolute", bottom: 8, right: 8, height: "20px" }}
                />
            </Box>

            <CardContent sx={{ flex: 1 }}>
                <Stack spacing={1.5}>
                    <Box>
                        <Typography variant="subtitle1" noWrap title={photo.songTitle}>
                            {photo.songTitle || t("album.untitled")}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                            <Chip
                                size="small"
                                label={photo.songdifficulty.toUpperCase()}
                                sx={{ bgcolor: color, color: "common.black", fontWeight: 700 }}
                            />
                        </Stack>
                    </Box>

                    <Tooltip title={formatDate(photo.date, true)} placement="top" arrow>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ display: "flex", alignItems: "center", gap: 0.5, width: "fit-content" }}
                        >
                            <ClockIcon fontSize="small" />
                            {formatDate(photo.date)}
                        </Typography>
                    </Tooltip>

                    <Typography
                        variant="body2"
                        color="textSecondary"
                        title={photo.location}
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                        <LocationIcon fontSize="small" />
                        <Box
                            component="span"
                            sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                            <Link
                                color="inherit"
                                href={"https://www.google.com/maps/search/" + encodeURIComponent(photo.location)}
                                target="_blank"
                                rel="noopener"
                            >
                                {photo.location || "-"}
                            </Link>
                        </Box>
                    </Typography>
                </Stack>
            </CardContent>

            <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                    component="a"
                    href={photo.imageUrl}
                    target="_blank"
                    rel="noopener"
                    startIcon={<OpenInNewIcon />}
                >
                    {t("album.openImage")}
                </Button>
            </CardActions>
        </Card>
    );
}

function PagePlayerAlbum() {
    const { t } = useTranslation("player");
    const { app, player } = rootStore;
    const loading = player.albumLoading;
    const error = player.albumError;
    const [viewerPhoto, setViewerPhoto] = useState<GetPlayerAlbum | null>(null);
    const [viewerSourceRect, setViewerSourceRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        void player.ensureAlbum();
    }, [player]);

    useEffect(() => {
        app.setGlobalLoading(loading);
    }, [app, loading]);

    const sortedAlbum = useMemo(
        () => [...player.album].sort((left, right) => right.date.getTime() - left.date.getTime()),
        [player.album],
    );

    const handleViewImage = (photo: GetPlayerAlbum, sourceRect: DOMRect) => {
        setViewerSourceRect(sourceRect);
        setViewerPhoto(photo);
    };

    const handleCloseViewer = () => {
        setViewerPhoto(null);
        setViewerSourceRect(null);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                <Box>
                    <Typography variant="h5">{t("album.title")}</Typography>
                    <Typography color="textSecondary">{t("album.description")}</Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => void player.refreshAlbum()}
                    loading={loading}
                    disabled={loading}
                >
                    {t("album.reload")}
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
                        {t("album.showingPhotos", { count: sortedAlbum.length })}
                    </Typography>

                    {sortedAlbum.length === 0 ? (
                        <Alert severity="info">{t("album.empty")}</Alert>
                    ) : (
                        <Grid container spacing={2}>
                            {sortedAlbum.map((photo, index) => (
                                <Grid key={`${photo.imageUrl}-${index}`} size={{ xs: 12, sm: 6, lg: 4 }}>
                                    <AlbumCard photo={photo} onViewImage={handleViewImage} />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </>
            )}

            <ImageViewer
                photo={viewerPhoto ? { imageUrl: viewerPhoto.imageUrl, alt: viewerPhoto.songTitle } : null}
                sourceRect={viewerSourceRect}
                onClose={handleCloseViewer}
            />
        </Box>
    );
}

export default observer(PagePlayerAlbum);
