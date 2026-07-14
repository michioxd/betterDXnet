import {
    AppBar,
    Box,
    Container,
    Divider,
    Drawer,
    IconButton,
    LinearProgress,
    Paper,
    Toolbar,
    Tooltip,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import cls from "./Main.module.scss";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import ReplayIcon from "@mui/icons-material/Replay";
import { observer } from "mobx-react-lite";
import { rootStore } from "@/stores/root";
import { useEffect, useRef } from "react";
import LoadingView from "./Loading";
import FadingToolbarTitle from "@/components/FadingToolbarTitle";
import { HashRouter } from "react-router-dom";
import AppRoutes from "@/pages/routes";
import Footer from "@/components/Footer";
import Sidebar, { createSidebarSectionState } from "./Sidebar";

function MainView({ closeView }: { closeView?: () => void }) {
    const { me, app } = rootStore;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const refreshHoldTimeoutRef = useRef<number | null>(null);
    const refreshHoldTriggeredRef = useRef(false);

    const meLoading = me.loading;
    const isLoading = meLoading || app.isAppLoading;
    const isLogin = me.isLogin;
    const username = me.me?.name;
    const rankType = me.me?.rankType;
    const version = me.me?.version;

    useEffect(() => {
        app.ensureSidebarSectionsOpen(createSidebarSectionState());
    }, [app]);

    useEffect(() => {
        if (meLoading) return;

        if (isLogin) {
            document.title = `${username} - betterDXnet`;
        } else {
            document.title = "betterDXnet";
            void me.refresh();
        }
    }, [me, meLoading, isLogin, username]);

    useEffect(() => {
        if (!isMobile) {
            app.setSidebarOpen(false);
        }
    }, [app, isMobile]);

    const clearRefreshHoldTimeout = () => {
        if (refreshHoldTimeoutRef.current === null) return;

        window.clearTimeout(refreshHoldTimeoutRef.current);
        refreshHoldTimeoutRef.current = null;
    };

    const startRefreshHold = () => {
        if (meLoading) return;

        refreshHoldTriggeredRef.current = false;
        clearRefreshHoldTimeout();

        refreshHoldTimeoutRef.current = window.setTimeout(() => {
            refreshHoldTriggeredRef.current = true;
            refreshHoldTimeoutRef.current = null;
            void me.fullyReload();
        }, 600);
    };

    const handleRefreshClick = () => {
        if (refreshHoldTriggeredRef.current) {
            refreshHoldTriggeredRef.current = false;
            return;
        }

        void me.refresh();
    };

    return (
        <Paper component="main" className={cls.mainView}>
            <AppBar position="sticky" color="primary">
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="open sidebar"
                            onClick={() => app.setSidebarOpen(true)}
                            sx={{ mr: 1 }}
                        >
                            <MenuIcon fontWeight="medium" />
                        </IconButton>
                    )}

                    <FadingToolbarTitle
                        username={isLogin ? username : undefined}
                        rankType={rankType}
                        version={version}
                    />

                    <Tooltip title="Refresh profile. Hold to fully reload." placement="bottom" arrow>
                        <span>
                            <IconButton
                                size="large"
                                edge="end"
                                color="inherit"
                                aria-label="refresh"
                                disabled={meLoading}
                                onPointerDown={startRefreshHold}
                                onPointerUp={clearRefreshHoldTimeout}
                                onPointerLeave={clearRefreshHoldTimeout}
                                onPointerCancel={clearRefreshHoldTimeout}
                                onClick={handleRefreshClick}
                                loading={meLoading}
                            >
                                <ReplayIcon fontWeight="medium" />
                            </IconButton>
                        </span>
                    </Tooltip>

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

            {isLogin && me.me ? (
                <HashRouter>
                    <Box className={cls.contentLayout}>
                        {!isMobile && (
                            <Box className={cls.sidebarPanel} component="aside">
                                <Sidebar
                                    profile={me.me}
                                    sectionsOpen={app.sidebarSectionsOpen}
                                    onToggleSection={(key) => app.toggleSidebarSection(key)}
                                />
                            </Box>
                        )}
                        <Container className={cls.contentPanel} maxWidth="xl" sx={{ pt: 3 }}>
                            <AppRoutes />
                            <Footer />
                        </Container>
                    </Box>

                    <Drawer
                        open={app.sidebarOpen}
                        onClose={() => app.setSidebarOpen(false)}
                        variant="temporary"
                        ModalProps={{ keepMounted: true }}
                        slotProps={{ paper: { className: cls.sidebarDrawerPaper } }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", p: 1 }}>
                            <IconButton onClick={() => app.setSidebarOpen(false)} aria-label="close sidebar">
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        <Divider />
                        <Sidebar
                            profile={me.me}
                            sectionsOpen={app.sidebarSectionsOpen}
                            onToggleSection={(key) => app.toggleSidebarSection(key)}
                        />
                    </Drawer>
                </HashRouter>
            ) : (
                <Container className={cls.contentPanel}>
                    <LoadingView />
                    <Footer />
                </Container>
            )}
        </Paper>
    );
}

export default observer(MainView);
