import ProfileCard from "@/components/ProfileCard";
import { rootStore } from "@/stores/root";
import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";

function PageHome() {
    const { t } = useTranslation("pages");
    const { me } = rootStore;
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography variant="h5">{t("home.welcome", { version: import.meta.env.VITE_APP_VERSION })}</Typography>
            <Typography color="textSecondary">
                {t("home.loggedInAs")}{" "}
                <Typography component="span" sx={{ fontWeight: "bold" }}>
                    {me.me?.name}
                </Typography>
            </Typography>
            {me?.me && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <Box sx={{ my: 2, maxWidth: 500, width: "100%" }}>
                        <ProfileCard d={me?.me} />
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default observer(PageHome);
