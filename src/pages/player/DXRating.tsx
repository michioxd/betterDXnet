import { difficultyColor } from "@/api/records";
import { playlogBaseImg, songKindBaseImg } from "@/api/records/types";
import type { GetPlayerDXRatingItem } from "@/api/player";
import type { GameRecordSong } from "@/api/records";
import { getSongArtworkUrl } from "@/db/maimaiDataApi";
import { rootStore } from "@/stores/root";
import RatingCanvas, { type RatingCanvasHandle } from "@/utils/image/dx";
import { calculateManualDXRating, sumManualDXRating } from "@/utils/manualDxRating";
import RefreshIcon from "@mui/icons-material/Refresh";
import StarIcon from "@mui/icons-material/Star";
import GetAppIcon from "@mui/icons-material/GetApp";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    LinearProgress,
    Stack,
    Tab,
    Tabs,
    Tooltip,
    Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppMode } from "@/app-context";

function formatPercent(value: number) {
    return `${value.toFixed(4)}%`;
}

type DXRatingItem = GetPlayerDXRatingItem | GameRecordSong;
type ExportStatus = "preparingCanvas" | "loadingAssets" | "exportingImage" | "downloadStarted" | "exportFailed";

function DXRatingCard({ item }: { item: DXRatingItem }) {
    const { t } = useTranslation("player");
    const color = difficultyColor[item.songdifficulty];
    const artworkUrl = item.songFullDetail ? getSongArtworkUrl(item.songFullDetail.song) : "";

    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                borderColor: color,
                bgcolor: `color-mix(in srgb, ${color} 5%, transparent)`,
            }}
        >
            <CardContent sx={{ height: "100%" }}>
                <Stack spacing={2} sx={{ height: "100%" }}>
                    <Stack direction="row" spacing={2}>
                        {item.songFullDetail && (
                            <Box sx={{ position: "relative", flexShrink: 0 }}>
                                <CardMedia
                                    component="img"
                                    image={artworkUrl}
                                    alt={item.songTitle}
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
                                <CardMedia
                                    component="img"
                                    image={artworkUrl}
                                    alt={item.songTitle}
                                    sx={{
                                        width: 88,
                                        height: 88,
                                        borderRadius: 1,
                                        objectFit: "cover",
                                        position: "relative",
                                    }}
                                />
                                <Box
                                    component="img"
                                    src={songKindBaseImg.replace(
                                        "{}",
                                        item.songKind === "std" ? "standard" : item.songKind,
                                    )}
                                    alt={item.songKind}
                                    sx={{ position: "absolute", bottom: -5, right: -5, height: 18 }}
                                />
                            </Box>
                        )}

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            {item.songFullDetail?.song.artist && (
                                <Typography variant="subtitle2" color="textSecondary" noWrap sx={{ fontSize: 12 }}>
                                    {item.songFullDetail.song.artist}
                                </Typography>
                            )}
                            <Typography variant="subtitle1" noWrap title={item.songTitle}>
                                {item.songTitle || t("dxrating.untitled")}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", rowGap: 1 }}>
                                <Chip
                                    size="small"
                                    label={item.songdifficulty.toUpperCase()}
                                    sx={{ bgcolor: color, color: "common.black", fontWeight: 700 }}
                                />
                                <Chip size="small" label={`Lv ${item.songLevel}`} />
                            </Stack>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                            <Typography variant="caption" color="textSecondary">
                                {t("dxrating.achievement")}
                            </Typography>
                            <Typography variant="h6" color="primary.main">
                                {formatPercent(item.achievement)}
                            </Typography>
                        </Box>

                        <Box
                            component="img"
                            src={playlogBaseImg.replace("{}", item.scoreRank)}
                            alt={item.scoreRank}
                            sx={{ height: 44, objectFit: "contain" }}
                        />

                        <Box sx={{ textAlign: "right" }}>
                            <Typography variant="caption" color="textSecondary">
                                {t("dxrating.rating")}
                            </Typography>
                            <Tooltip title={item.rating === undefined ? t("dxrating.ratingUnavailable") : ""} arrow>
                                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <StarIcon
                                        fontSize="small"
                                        color={item.rating === undefined ? "disabled" : "warning"}
                                    />
                                    {item.rating ?? "-"}
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

function DXRatingSection({ title, items }: { title: string; items: DXRatingItem[] }) {
    const { t } = useTranslation("player");
    const totalRating = items.reduce((total, item) => total + (item.rating ?? 0), 0);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "baseline" }}>
                <Box>
                    <Typography variant="h6">{title}</Typography>
                    <Typography color="textSecondary">
                        {t("dxrating.sectionSummary", { count: items.length, rating: totalRating })}
                    </Typography>
                </Box>
            </Box>

            {items.length === 0 ? (
                <Alert severity="info">{t("dxrating.emptySection")}</Alert>
            ) : (
                <Grid container spacing={2}>
                    {items.map((item, index) => (
                        <Grid key={`${item.id}-${index}`} size={{ xs: 12, md: 6, xl: 4 }}>
                            <DXRatingCard item={item} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
}

const isFirefox = () => {
    return navigator.userAgent.toLowerCase().includes("firefox");
};

function PagePlayerDXRating() {
    const appModeCtx = useAppMode();
    const { t } = useTranslation("player");
    const { app, player, me } = rootStore;
    const [tab, setTab] = useState(0);
    const [exportOpen, setExportOpen] = useState(false);
    const [exportProgress, setExportProgress] = useState({ loaded: 0, total: 1 });
    const [exportLogs, setExportLogs] = useState<string[]>([]);
    const [exportStatus, setExportStatus] = useState<ExportStatus>("preparingCanvas");
    const [exportError, setExportError] = useState<string | null>(null);
    const canvasRef = useRef<RatingCanvasHandle>(null);
    const exportCancelledRef = useRef(false);
    const exportDoneRef = useRef(false);
    const isManualTab = tab === 0;
    const loading = isManualTab ? player.manualDxratingLoading : player.dxratingLoading;
    const error = isManualTab ? player.manualDxratingError : player.dxratingError;
    const dxrating = player.dxrating;
    const manualDxrating = useMemo(
        () => calculateManualDXRating(player.manualDxratingRecords, me.me?.version),
        [player.manualDxratingRecords, me.me?.version],
    );

    useEffect(() => {
        void player.ensureDxrating();
    }, [player]);

    useEffect(() => {
        if (!isManualTab) return;

        void player.ensureManualDxrating();
    }, [isManualTab, player]);

    useEffect(() => {
        app.setGlobalLoading(loading);
    }, [app, loading]);

    const totalCount =
        dxrating.new.length + dxrating.old.length + dxrating.selectionNew.length + dxrating.selectionOld.length;
    const totalRating = [...dxrating.new, ...dxrating.old].reduce((total, item) => total + (item.rating ?? 0), 0);
    const manualTotalCount = manualDxrating.new.length + manualDxrating.old.length;
    const manualTotalRating = sumManualDXRating([...manualDxrating.new, ...manualDxrating.old]);
    const handleRefresh = () => {
        if (isManualTab) {
            void player.refreshManualDxrating();
            return;
        }

        void player.refreshDxrating();
    };
    const handleGenerateImage = () => {
        exportCancelledRef.current = false;
        exportDoneRef.current = false;
        setExportProgress({ loaded: 0, total: 1 });
        setExportStatus("preparingCanvas");
        setExportError(null);
        setExportLogs([t("dxrating.export.status.preparingCanvas")]);
        setExportOpen(true);
    };
    const handleCancelExport = () => {
        exportCancelledRef.current = true;
        setExportOpen(false);
        canvasRef.current?.destroy();
        canvasRef.current = null;
    };
    const handleExportProgress = useCallback(
        async (loaded: number, total: number, message?: string) => {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setExportProgress({ loaded, total });
            setExportStatus(loaded < total ? "loadingAssets" : "exportingImage");
            if (message) {
                setExportLogs((logs) => [...logs, t("dxrating.export.log.asset", { loaded, total, message })]);
            }

            if (exportCancelledRef.current || exportDoneRef.current || loaded < total) return;

            exportDoneRef.current = true;
            setExportLogs((logs) => [...logs, t("dxrating.export.status.exportingImage")]);

            requestAnimationFrame(() => {
                const dataUrl = canvasRef.current?.exportImage();

                canvasRef.current?.destroy();
                canvasRef.current = null;

                if (!dataUrl) {
                    setExportStatus("exportFailed");
                    setExportError(t("dxrating.export.error.renderFailed"));
                    setExportLogs((logs) => [...logs, t("dxrating.export.error.renderFailed")]);
                    return;
                }

                const link = document.createElement("a");
                link.href = dataUrl;
                link.download = `betterDXnet-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                setExportStatus("downloadStarted");
                setExportLogs((logs) => [...logs, t("dxrating.export.status.downloadStarted")]);
                setExportOpen(false);
            });
        },
        [t],
    );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start" }}>
                <Box>
                    <Typography variant="h5">{t("dxrating.title")}</Typography>
                    <Typography color="textSecondary">{t("dxrating.description")}</Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    loading={loading}
                    disabled={loading}
                >
                    {t("dxrating.reload")}
                </Button>
            </Box>

            <Tabs value={tab} onChange={(_, value: number) => setTab(value)}>
                <Tab label={t("dxrating.tabs.manual")} />
                <Tab label={t("dxrating.tabs.dxnet")} />
            </Tabs>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && <Alert severity="error">{error.message}</Alert>}

            {!loading && !error && !isManualTab && (
                <>
                    <Alert severity="info">
                        {t("dxrating.showingItems", { count: totalCount, rating: totalRating })}
                    </Alert>

                    <DXRatingSection title={t("dxrating.sections.new")} items={dxrating.new} />
                    <Divider />
                    <DXRatingSection title={t("dxrating.sections.old")} items={dxrating.old} />
                    <Divider />
                    <DXRatingSection title={t("dxrating.sections.selectionNew")} items={dxrating.selectionNew} />
                    <Divider />
                    <DXRatingSection title={t("dxrating.sections.selectionOld")} items={dxrating.selectionOld} />
                </>
            )}

            {!loading && !error && isManualTab && (
                <>
                    <Alert severity="info">
                        {t("dxrating.showingItems", { count: manualTotalCount, rating: manualTotalRating })}
                    </Alert>

                    <Button
                        variant="contained"
                        onClick={handleGenerateImage}
                        disabled={manualTotalCount === 0 || (isFirefox() && appModeCtx !== "standalone") || exportOpen}
                        startIcon={<GetAppIcon />}
                    >
                        {t("dxrating.export.generateImage")}
                    </Button>

                    {isFirefox() && appModeCtx !== "standalone" && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            {t("dxrating.export.firefoxNote")}
                        </Alert>
                    )}

                    <Dialog
                        open={exportOpen}
                        maxWidth="sm"
                        fullWidth
                        onClose={(_, reason) => {
                            if (reason === "backdropClick") return;

                            handleCancelExport();
                        }}
                    >
                        <DialogTitle>{t("dxrating.export.title")}</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2}>
                                <Typography>
                                    {t(`dxrating.export.status.${exportStatus}`)} -{" "}
                                    {exportStatus === "loadingAssets"
                                        ? t("dxrating.export.assetsLoaded", exportProgress)
                                        : t("dxrating.export.pleaseWait")}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.round((exportProgress.loaded / exportProgress.total) * 100)}
                                />
                                {exportError && (
                                    <Alert severity="error">
                                        <Typography variant="body2">{exportError}</Typography>
                                        <Box
                                            sx={{
                                                mt: 1,
                                                maxHeight: 180,
                                                overflow: "auto",
                                                borderRadius: 1,
                                                bgcolor: "background.default",
                                                p: 1.5,
                                            }}
                                        >
                                            {exportLogs.map((log, index) => (
                                                <Typography key={`${log}-${index}`} variant="caption" component="div">
                                                    {log}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Alert>
                                )}
                                <Typography variant="body2" color="textSecondary">
                                    {t("dxrating.export.unresponsiveNote")}
                                </Typography>
                                <Box sx={{ position: "fixed", left: -10000, top: 0, pointerEvents: "none" }}>
                                    <RatingCanvas
                                        ref={canvasRef}
                                        newItems={manualDxrating.new}
                                        oldItems={manualDxrating.old}
                                        profile={me.me ?? undefined}
                                        onAssetProgress={handleExportProgress}
                                    />
                                </Box>
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCancelExport}>{t("dxrating.export.cancel")}</Button>
                        </DialogActions>
                    </Dialog>

                    <DXRatingSection title={t("dxrating.sections.new")} items={manualDxrating.new} />
                    <Divider />
                    <DXRatingSection title={t("dxrating.sections.old")} items={manualDxrating.old} />
                </>
            )}
        </Box>
    );
}

export default observer(PagePlayerDXRating);
