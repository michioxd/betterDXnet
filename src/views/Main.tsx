import { AppBar, Container, IconButton, LinearProgress, Paper, Toolbar, Tooltip, Typography } from "@mui/material";
import cls from "./Main.module.scss";
import CloseIcon from "@mui/icons-material/Close";
import { observer } from "mobx-react-lite";
import { rootStore } from "@/stores/root";
import { useEffect, useMemo } from "react";
import LoadingView from "./Loading";

function MainView({ closeView }: { closeView?: () => void }) {
    const isLoading = useMemo(() => rootStore.me.loading, [rootStore.me.loading]);
    useEffect(() => {
        if (rootStore.me.loading) return;
        if (!rootStore.me.isLogin) {
            rootStore.me.refresh();
        }
    }, [rootStore.me.isLogin]);
    return (
        <>
            <Paper component="main" className={cls.mainView}>
                <AppBar position="sticky" color="primary">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            betterDXnet
                        </Typography>
                        <Tooltip title="Unload betterDXnet" placement="bottom" arrow>
                            <IconButton size="large" edge="end" color="inherit" aria-label="close" onClick={closeView}>
                                <CloseIcon fontWeight="medium" />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                    <LinearProgress
                        sx={{
                            width: "100%",
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            transition: "opacity 0.2s",
                            opacity: isLoading ? 1 : 0,
                        }}
                    />
                </AppBar>
                <Container>
                    <LoadingView />
                </Container>
            </Paper>
        </>
    );
}

export default observer(MainView);
