import { Box, Button, CircularProgress, Typography } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { useTranslation } from "react-i18next";

export default function LoadingView({ error, closeView }: { error?: Error | null; closeView?: () => void }) {
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
                        {error.message}
                    </Typography>
                    {closeView && (
                        <Button variant="contained" onClick={closeView} sx={{ mt: 2 }}>
                            {t("loading.close")}
                        </Button>
                    )}
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
