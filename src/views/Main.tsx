import {
    AppBar,
    Box,
    Collapse,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    LinearProgress,
    Paper,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import cls from "./Main.module.scss";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CollectionsIcon from "@mui/icons-material/Collections";
import ReplayIcon from "@mui/icons-material/Replay";
import { observer } from "mobx-react-lite";
import { rootStore } from "@/stores/root";
import { useEffect } from "react";
import LoadingView from "./Loading";

const sidebarSampleSections = [
    {
        key: "nameplate",
        label: "Nameplate",
        title: "Sample current nameplate",
        description: "Placeholder content for later implementation.",
        items: ["Current nameplate", "Available list", "Change history"],
    },
    {
        key: "icon",
        label: "Icon",
        title: "Sample current icon",
        description: "Placeholder content for later implementation.",
        items: ["Current icon", "Available list", "Favorites"],
    },
    {
        key: "frame",
        label: "Frame",
        title: "Sample current frame",
        description: "Placeholder content for later implementation.",
        items: ["Current frame", "Available list", "History"],
    },
    {
        key: "title",
        label: "Title",
        title: "Sample current title",
        description: "Placeholder content for later implementation.",
        items: ["Current title", "Available list", "Ranks"],
    },
    {
        key: "partner",
        label: "Partner",
        title: "Sample current partner",
        description: "Placeholder content for later implementation.",
        items: ["Current partner", "Available list", "Settings"],
    },
];

function createSidebarSectionState() {
    return sidebarSampleSections.reduce<Record<string, boolean>>((state, section) => {
        state[section.key] = true;
        return state;
    }, {});
}

function MainView({ closeView }: { closeView?: () => void }) {
    const { me, app } = rootStore;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const isLoading = me.loading || app.isAppLoading;
    const isLogin = me.isLogin;
    const username = me.me?.name;

    useEffect(() => {
        app.ensureSidebarSectionsOpen(createSidebarSectionState());
    }, [app]);

    const toggleSection = (key: string) => {
        app.toggleSidebarSection(key);
    };

    const renderSidebar = () => (
        <Box className={cls.sidebarContent}>
            <Box className={cls.sidebarHeader}></Box>

            <Divider />

            <List disablePadding dense>
                {sidebarSampleSections.map((item) => {
                    const isOpen = app.sidebarSectionsOpen[item.key] ?? false;

                    return (
                        <Box key={item.key}>
                            <ListItemButton onClick={() => toggleSection(item.key)}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <CollectionsIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={item.label} secondary={item.title} />
                                {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItemButton>

                            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                <List disablePadding dense sx={{ pl: 2 }}>
                                    <Box sx={{ px: 2, py: 1 }}>
                                        <Typography variant="subtitle2">{item.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {item.description}
                                        </Typography>
                                    </Box>

                                    {item.items.map((subItem) => (
                                        <ListItemButton key={subItem} sx={{ pl: 4 }}>
                                            <ListItemText primary={subItem} />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    );
                })}
            </List>
        </Box>
    );

    useEffect(() => {
        if (me.loading) return;

        if (isLogin) {
            document.title = `${username} - betterDXnet`;
        } else {
            document.title = "betterDXnet";
            void me.refresh();
        }
    }, [me, me.loading, isLogin, username]);

    useEffect(() => {
        if (!isMobile) {
            app.setSidebarOpen(false);
        }
    }, [app, isMobile]);

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

                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                        data-ranking-color-type={me.me?.rankType ?? ""}
                    >
                        {isLogin ? `${username}` : "betterDXnet"}
                    </Typography>

                    <Tooltip title="Refresh profile" placement="bottom" arrow>
                        <IconButton
                            size="large"
                            edge="end"
                            color="inherit"
                            aria-label="refresh"
                            disabled={me.loading}
                            onClick={() => void me.refresh()}
                        >
                            <ReplayIcon fontWeight="medium" />
                        </IconButton>
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

            {isLogin ? (
                <>
                    <Box className={cls.contentLayout}>
                        {!isMobile && (
                            <Box className={cls.sidebarPanel} component="aside">
                                {renderSidebar()}
                            </Box>
                        )}
                        <Container className={cls.contentPanel}>{isLogin ? <></> : <LoadingView />}</Container>
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
                        {renderSidebar()}
                    </Drawer>
                </>
            ) : (
                <Container>
                    <LoadingView />
                </Container>
            )}
        </Paper>
    );
}

export default observer(MainView);
