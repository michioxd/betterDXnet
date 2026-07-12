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
import ReplayIcon from "@mui/icons-material/Replay";
import { observer } from "mobx-react-lite";
import { rootStore } from "@/stores/root";
import { useEffect } from "react";
import LoadingView from "./Loading";
import ProfileCard from "@/components/ProfileCard";
import FadingToolbarTitle from "@/components/FadingToolbarTitle";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import CollectionsIcon from "@mui/icons-material/Collections";
import SettingsIcon from "@mui/icons-material/Settings";
import type { SvgIconComponent } from "@mui/icons-material";
import { HashRouter, NavLink } from "react-router-dom";
import AppRoutes from "@/pages/routes";

type SidebarSection = {
    key: string;
    label: string;
    icon: SvgIconComponent;
    title?: string;
    description?: string;
    to?: string;
    items?: {
        label: string;
        to: string;
        icon?: SvgIconComponent;
    }[];
};

const sidebarSampleSections: SidebarSection[] = [
    {
        key: "home",
        label: "Home",
        icon: HomeIcon,
        items: [
            { label: "Overview", to: "/" },
            { label: "DX Rating", to: "/dx-rating" },
            { label: "Record of maimai", to: "/maimai-record" },
        ],
    },
    {
        key: "playdata",
        label: "Player Data",
        icon: PersonIcon,
        items: [
            { label: "Player data", to: "/playdata" },
            { label: "Stamp card", to: "/playdata/stamp-card" },
            { label: "Album", to: "/playdata/album" },
        ],
    },
    {
        key: "shop",
        label: "maimile Shop",
        icon: StorefrontIcon,
        to: "/shop",
    },
    {
        key: "title",
        label: "Records",
        icon: AssessmentIcon,
        items: [
            { label: "Game records", to: "/records/game" },
            { label: "Song scores", to: "/records/songs" },
            { label: "Courses", to: "/records/courses" },
            { label: "World stats", to: "/records/worldstats" },
        ],
    },
    {
        key: "event",
        label: "Events",
        icon: EventIcon,
        items: [
            { label: "Area", to: "/events/area" },
            { label: "Event area", to: "/events/event-area" },
            { label: "End event area", to: "/events/end-event-area" },
            { label: "Season info", to: "/events/season-info" },
        ],
    },
    {
        key: "collections",
        label: "Collections",
        icon: CollectionsIcon,
        items: [
            { label: "Icon", to: "/collections/icon" },
            { label: "Nameplate", to: "/collections/nameplate" },
            { label: "Frame", to: "/collections/frame" },
            { label: "Title", to: "/collections/title" },
            { label: "Tour member", to: "/collections/tour-member" },
            { label: "Partner", to: "/collections/partner" },
        ],
    },
    {
        key: "settings",
        label: "Settings",
        icon: SettingsIcon,
        items: [
            { label: "Game options", to: "/settings/game" },
            { label: "Player", to: "/settings/player" },
            { label: "Favorite songs", to: "/settings/favorite-songs" },
        ],
    },
];

function createSidebarSectionState() {
    return sidebarSampleSections.reduce<Record<string, boolean>>((state, section) => {
        state[section.key] = false;
        return state;
    }, {});
}

function MainView({ closeView }: { closeView?: () => void }) {
    const { me, app } = rootStore;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const meLoading = me.loading;
    const isLoading = meLoading || app.isAppLoading;
    const isLogin = me.isLogin;
    const username = me.me?.name;
    const rankType = me.me?.rankType;
    const version = me.me?.version;

    useEffect(() => {
        app.ensureSidebarSectionsOpen(createSidebarSectionState());
    }, [app]);

    const toggleSection = (key: string) => {
        app.toggleSidebarSection(key);
    };

    const renderSidebar = () =>
        me.me && (
            <Box className={cls.sidebarContent}>
                <Box className={cls.sidebarHeader}>
                    <ProfileCard d={me.me} />
                </Box>

                <Divider />

                <List disablePadding dense>
                    {sidebarSampleSections.map((item) => {
                        const isOpen = app.sidebarSectionsOpen[item.key] ?? false;
                        const SidebarIcon = item.icon;

                        if (!item.items) {
                            return (
                                <Box key={item.key}>
                                    <ListItemButton component={NavLink} to={item.to ?? "/"}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <SidebarIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={item.label} secondary={item.title} />
                                    </ListItemButton>
                                </Box>
                            );
                        }

                        return (
                            <Box key={item.key}>
                                <ListItemButton onClick={() => toggleSection(item.key)}>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <SidebarIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={item.label} secondary={item.title} />
                                    {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </ListItemButton>

                                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                    <List disablePadding dense sx={{ pl: 2 }}>
                                        {(item.title || item.description) && (
                                            <Box sx={{ px: 2, py: 1 }}>
                                                {item.title && (
                                                    <Typography variant="subtitle2">{item.title}</Typography>
                                                )}
                                                {item.description && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {item.description}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        {item.items.map((subItem) => {
                                            const SubItemIcon = subItem.icon;

                                            return (
                                                <ListItemButton
                                                    key={subItem.to}
                                                    component={NavLink}
                                                    to={subItem.to}
                                                    sx={{ pl: 4 }}
                                                >
                                                    {SubItemIcon && (
                                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                                            <SubItemIcon fontSize="small" />
                                                        </ListItemIcon>
                                                    )}
                                                    <ListItemText primary={subItem.label} />
                                                </ListItemButton>
                                            );
                                        })}
                                    </List>
                                </Collapse>
                            </Box>
                        );
                    })}
                </List>
            </Box>
        );

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

                    <Tooltip title="Refresh profile" placement="bottom" arrow>
                        <span>
                            <IconButton
                                size="large"
                                edge="end"
                                color="inherit"
                                aria-label="refresh"
                                disabled={meLoading}
                                onClick={() => void me.refresh()}
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
                                {renderSidebar()}
                            </Box>
                        )}
                        <Container className={cls.contentPanel} maxWidth="xl" sx={{ pt: 3 }}>
                            <AppRoutes />
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
                        {renderSidebar()}
                    </Drawer>
                </HashRouter>
            ) : (
                <Container>
                    <LoadingView />
                </Container>
            )}
        </Paper>
    );
}

export default observer(MainView);
