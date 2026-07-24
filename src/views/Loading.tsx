import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { useTranslation } from "react-i18next";
import { useAppMode } from "@/app-context";
import CloseIcon from "@mui/icons-material/Close";
import LoginIcon from "@mui/icons-material/Login";

export default function LoadingView({ error, closeView }: { error?: Error | null; closeView?: () => void }) {
    const appModeCtx = useAppMode();
    const { t } = useTranslation("layout");

    return (
        <>
            {error ? (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        flex: 1,
                        pt: "12.5%",
                        px: 2,
                    }}
                >
                    <ErrorIcon sx={{ fontSize: 100 }} />
                    <Typography align="center" variant="h6" sx={{ mt: 2 }}>
                        {t("loading.errorTitle")}
                    </Typography>
                    <Typography align="center" variant="body2" color="textSecondary" sx={{ maxWidth: 500 }}>
                        {error.message === "Failed to fetch" ? t("loading.errorNetwork") : error.message}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        {error.message === "Failed to fetch" && (
                            <Button
                                component="a"
                                href="https://lng-tgk-aime-gw.am-all.net/common_auth/login?site_id=maimaidxex&redirect_url=https://maimaidx-eng.com/maimai-mobile/&back_url=https://maimai.sega.com/"
                                variant="contained"
                                sx={{ mt: 2 }}
                                startIcon={<LoginIcon />}
                            >
                                {t("loading.goToLogin")}
                            </Button>
                        )}
                        {closeView && appModeCtx !== "standalone" && (
                            <Button variant="outlined" onClick={closeView} sx={{ mt: 2 }} startIcon={<CloseIcon />}>
                                {t("loading.close")}
                            </Button>
                        )}
                    </Stack>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        flex: 1,
                        pt: "25%",
                        px: 2,
                    }}
                >
                    <CircularProgress />
                    <Typography align="center" variant="body2" sx={{ mt: 2 }} color="textSecondary">
                        {t("loading.fetchingData")}
                    </Typography>
                </Box>
            )}
        </>
    );
}
