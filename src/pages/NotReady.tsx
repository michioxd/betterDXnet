import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function NotReady() {
    const { t } = useTranslation("pages");
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/", { replace: true });
    }, []);

    return (
        <Box>
            <Typography variant="h4">{t("notReady.title")}</Typography>
            <Typography color="textSecondary">{t("notReady.description")}</Typography>
        </Box>
    );
}
