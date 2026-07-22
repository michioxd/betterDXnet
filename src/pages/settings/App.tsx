import { maimaiApi } from "@/db/maimaiDataApi";
import { dataSource } from "@/db/maimaiDataTypes";
import { rootStore } from "@/stores/root";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudSyncIcon from "@mui/icons-material/CloudSync";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import StorageIcon from "@mui/icons-material/Storage";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Link,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

function PageSettingsApp() {
    const { t } = useTranslation("settings");
    const { app } = rootStore;
    const defaultDataUrl = useMemo(() => maimaiApi.getDefaultDataUrl(), []);
    const [cacheInfo, setCacheInfo] = useState(() => maimaiApi.getCacheInfo());
    const [dataUrl, setDataUrl] = useState(() => maimaiApi.getDataUrl());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        app.setGlobalLoading(loading);
    }, [app, loading]);

    const trimmedDataUrl = dataUrl.trim();
    const currentDataUrl = maimaiApi.getDataUrl();
    const isCustomDataUrl = currentDataUrl !== defaultDataUrl;
    const isDataUrlChanged = trimmedDataUrl !== currentDataUrl;
    const isValidDataUrl = useMemo(() => {
        try {
            const url = new URL(trimmedDataUrl);

            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    }, [trimmedDataUrl]);
    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "medium",
            }),
        [],
    );

    const formatTime = (value?: number | string) => {
        if (!value) return t("betterDXnet.notAvailable");

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return t("betterDXnet.notAvailable");

        return dateFormatter.format(date);
    };

    const handleSaveDataUrl = () => {
        setError(null);
        setSuccessMessage(null);

        try {
            maimaiApi.setDataUrl(trimmedDataUrl);
            setDataUrl(maimaiApi.getDataUrl());
            setCacheInfo(maimaiApi.getCacheInfo());
            setSuccessMessage(t("betterDXnet.dataUrlSaved"));
        } catch (error) {
            setError(error as Error);
        }
    };

    const handleResetDataUrl = () => {
        maimaiApi.resetDataUrl();
        setDataUrl(maimaiApi.getDataUrl());
        setCacheInfo(maimaiApi.getCacheInfo());
        setError(null);
        setSuccessMessage(t("betterDXnet.dataUrlReset"));
    };

    const handleReloadDatabase = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (isDataUrlChanged) {
                maimaiApi.setDataUrl(trimmedDataUrl);
                setDataUrl(maimaiApi.getDataUrl());
            }

            await maimaiApi.reload();
            setCacheInfo(maimaiApi.getCacheInfo());
            setSuccessMessage(t("betterDXnet.databaseUpdated"));
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5">{t("betterDXnet.title")}</Typography>
                <Typography color="textSecondary">{t("betterDXnet.description")}</Typography>
            </Box>

            {error && <Alert severity="error">{error.message}</Alert>}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <StorageIcon color="primary" />
                            <Typography variant="h6">{t("betterDXnet.maimaiDataApi")}</Typography>
                        </Stack>

                        <Alert severity="info">
                            <Trans
                                i18nKey="betterDXnet.compatibilityNotice"
                                ns="settings"
                                components={{
                                    formatLink: (
                                        <Link
                                            color="inherit"
                                            href="https://github.com/michioxd/betterDXnet/blob/main/src/db/maimaiDataTypes.ts"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        />
                                    ),
                                }}
                            />
                        </Alert>

                        <TextField
                            fullWidth
                            label={t("betterDXnet.currentDataUrl")}
                            value={currentDataUrl}
                            disabled
                            slotProps={{ input: { readOnly: true } }}
                        />

                        <TextField
                            fullWidth
                            label={t("betterDXnet.customDataUrl")}
                            value={dataUrl}
                            disabled={loading}
                            error={Boolean(trimmedDataUrl) && !isValidDataUrl}
                            helperText={
                                Boolean(trimmedDataUrl) && !isValidDataUrl
                                    ? t("betterDXnet.invalidUrl")
                                    : t("betterDXnet.customDataUrlHelper")
                            }
                            onChange={(event) => setDataUrl(event.target.value)}
                        />

                        <Box>
                            <Typography variant="body2" color="textSecondary">
                                {t("betterDXnet.defaultDataUrl")}
                            </Typography>
                            <Typography sx={{ overflowWrap: "anywhere" }}>{defaultDataUrl}</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ fontSize: "12px" }}>
                                {t("betterDXnet.dataSourceFrom")}{" "}
                                <Link color="inherit" href={dataSource.link} target="_blank" rel="noopener noreferrer">
                                    {dataSource.source}
                                </Link>
                            </Typography>
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "flex-end" }}>
                            <Button
                                variant="outlined"
                                startIcon={<RestartAltIcon />}
                                disabled={loading || !isCustomDataUrl}
                                onClick={handleResetDataUrl}
                            >
                                {t("common.reset")}
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                disabled={loading || !isDataUrlChanged || !isValidDataUrl}
                                onClick={handleSaveDataUrl}
                            >
                                {t("common.save")}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <CloudSyncIcon color="primary" />
                            <Typography variant="h6">{t("betterDXnet.database")}</Typography>
                        </Stack>

                        <Typography color="textSecondary">{t("betterDXnet.databaseDescription")}</Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gap: 2,
                                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                            }}
                        >
                            <Box>
                                <Typography variant="body2" color="textSecondary">
                                    {t("betterDXnet.lastFetchedAt")}
                                </Typography>
                                <Typography>{formatTime(cacheInfo.fetchedAt)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="textSecondary">
                                    {t("betterDXnet.dataUpdateTime")}
                                </Typography>
                                <Typography>{formatTime(cacheInfo.updateTime)}</Typography>
                            </Box>
                        </Box>

                        <Divider />

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                startIcon={loading ? <CircularProgress color="inherit" size={16} /> : <SettingsIcon />}
                                disabled={loading || !isValidDataUrl}
                                onClick={() => void handleReloadDatabase()}
                            >
                                {t("betterDXnet.reupdateDatabase")}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

export default PageSettingsApp;
