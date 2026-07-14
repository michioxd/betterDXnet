import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function NotReady() {
    const { t } = useTranslation("pages");

    return (
        <Box>
            <Typography variant="h4">{t("notReady.title")}</Typography>
            <Typography color="textSecondary">{t("notReady.description")}</Typography>
        </Box>
    );
}
