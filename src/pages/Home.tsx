import ProfileCard from "@/components/ProfileCard";
import { rootStore } from "@/stores/root";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Alert, AlertTitle, Box, Button, CircularProgress, Link, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link as LinkRouter } from "react-router-dom";
import RedeemIcon from "@mui/icons-material/Redeem";

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

            <Alert severity="info">
                <AlertTitle>Hi there!</AlertTitle>
                Thanks for using betterDXnet! This is an early version of the extension, and there may be bugs or
                missing features. If you encounter any issues, please report them on our{" "}
                <Link
                    color="inherit"
                    href="https://github.com/michioxd/betterDXnet/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub Issues
                </Link>
                . Since this extension is fully open source on{" "}
                <Link
                    color="inherit"
                    href="https://github.com/michioxd/betterDXnet"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </Link>
                , feel free to contribute or suggest improvements! Have fun!
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <Button
                        color="inherit"
                        component={Link}
                        href="https://buymeacoffee.com/michioxd"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ ml: 1 }}
                        variant="outlined"
                        startIcon={<RedeemIcon />}
                    >
                        Buy me a coffee
                    </Button>
                </Box>
            </Alert>

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
                    <Button component={LinkRouter} to="/records/game" variant="outlined">
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
