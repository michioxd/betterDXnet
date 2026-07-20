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
import BrightnessAutoIcon from "@mui/icons-material/BrightnessAuto";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
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
import { LangSelectorComponent } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@mui/material/styles";

function MainView({ closeView }: { closeView?: () => void }) {
    const { t } = useTranslation("layout");
    const { me, app } = rootStore;
    const theme = useTheme();
    const { mode, systemMode, setMode } = useColorScheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const refreshHoldTimeoutRef = useRef<number | null>(null);
    const refreshHoldTriggeredRef = useRef(false);

    const meLoading = me.loading;
    const isLoading = meLoading || app.isAppLoading;
    const isLogin = me.isLogin;
    const isError = me.error !== null;
    const username = me.me?.name;
    const rankType = me.me?.rankType;
    const version = me.me?.version;
    const activeMode = mode === "system" ? systemMode : mode;
    const isDarkMode = activeMode === "dark";
    const themeMode = mode ?? "system";
    const themeModeLabel = t(`toolbar.themeMode.${themeMode}`);

    useEffect(() => {
        app.ensureSidebarSectionsOpen(createSidebarSectionState());
    }, [app]);

    useEffect(() => {
        if (meLoading) return;

        if (isLogin) {
            document.title = `${username} - betterDXnet`;
        } else if (!isError) {
            document.title = "betterDXnet";
            void me.refresh();
        }
    }, [me, meLoading, isLogin, username, isError]);

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

    const toggleThemeMode = () => {
        if (themeMode === "light") {
            setMode("dark");
        } else if (themeMode === "dark") {
            setMode("system");
        } else {
            setMode("light");
        }
    };

    const themeModeIcon = () => {
        if (themeMode === "light") return <LightModeIcon fontWeight="medium" />;
        if (themeMode === "dark") return <DarkModeIcon fontWeight="medium" />;

        return <BrightnessAutoIcon fontWeight="medium" />;
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
                            aria-label={t("toolbar.openSidebar")}
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

                    <LangSelectorComponent minimal />

                    <Tooltip title={t("toolbar.themeModeLabel", { mode: themeModeLabel })} placement="bottom" arrow>
                        <IconButton
                            size="large"
                            edge="end"
                            color="inherit"
                            aria-label={t("toolbar.themeModeLabel", { mode: themeModeLabel })}
                            onClick={toggleThemeMode}
                        >
                            {themeModeIcon()}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={t("toolbar.refreshProfile")} placement="bottom" arrow>
                        <span>
                            <IconButton
                                size="large"
                                edge="end"
                                color="inherit"
                                aria-label={t("toolbar.refresh")}
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

                    <Tooltip title={t("toolbar.unload")} placement="bottom" arrow>
                        <IconButton
                            size="large"
                            edge="end"
                            color="inherit"
                            aria-label={t("toolbar.close")}
                            onClick={closeView}
                        >
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

            {isError ? (
                <Box className={cls.contentPanel}>
                    <LoadingView error={me.error} closeView={closeView} />
                    <Footer />
                </Box>
            ) : (
                <>
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
                                    <IconButton
                                        onClick={() => app.setSidebarOpen(false)}
                                        aria-label={t("toolbar.closeSidebar")}
                                    >
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
                </>
            )}
        </Paper>
    );
}

export default observer(MainView);
