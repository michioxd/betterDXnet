import ProfileCard from "@/components/ProfileCard";
import { rootStore } from "@/stores/root";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { colorFromSessionStart, RecordCard } from "./records/Last50";

function PageHome() {
    const { t } = useTranslation("pages");
    const { me, records } = rootStore;

    useEffect(() => {
        void records.ensureLast50();
    }, [records]);

    const recentRecords = useMemo(
        () => [...records.last50].sort((left, right) => right.playDate.getTime() - left.playDate.getTime()).slice(0, 4),
        [records.last50],
    );

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            <Box>
                <Typography variant="h5">{t("home.welcome", { version: import.meta.env.VITE_APP_VERSION })}</Typography>
                <Typography color="textSecondary">
                    {t("home.loggedInAs")}{" "}
                    <Typography component="span" sx={{ fontWeight: "bold" }}>
                        {me.me?.name}
                    </Typography>
                </Typography>
            </Box>

            {me?.me && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <Box sx={{ maxWidth: 500, width: "100%" }}>
                        <ProfileCard d={me?.me} />
                    </Box>
                </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "center", mt: 1 }}>
                <Box>
                    <Typography variant="h6">{t("home.recentRecords")}</Typography>
                    <Typography color="textSecondary">{t("home.recentRecordsDescription")}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => void records.refreshLast50()}
                        loading={records.last50Loading}
                        disabled={records.last50Loading}
                    >
                        {t("home.reload")}
                    </Button>
                    <Button component={Link} to="/records/game" variant="outlined">
                        {t("home.seeAll")}
                    </Button>
                </Box>
            </Box>

            {records.last50Loading && recentRecords.length === 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {records.last50Error && <Typography color="error">{records.last50Error.message}</Typography>}

            {recentRecords.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    {recentRecords.map((record, index) => (
                        <Box key={`${record.id}-${index}`} sx={{ width: { xs: "100%", md: "calc(50% - 8px)" } }}>
                            <RecordCard record={record} sessionColor={colorFromSessionStart(record.playDate)} />
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
}

export default observer(PageHome);
