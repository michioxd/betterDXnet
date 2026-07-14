import { Box, Collapse, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import cls from "./Main.module.scss";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CasinoIcon from "@mui/icons-material/Casino";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FlagIcon from "@mui/icons-material/Flag";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import GroupIcon from "@mui/icons-material/Group";
import GroupsIcon from "@mui/icons-material/Groups";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PublicIcon from "@mui/icons-material/Public";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import StarIcon from "@mui/icons-material/Star";
import StyleIcon from "@mui/icons-material/Style";
import TodayIcon from "@mui/icons-material/Today";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventIcon from "@mui/icons-material/Event";
import CollectionsIcon from "@mui/icons-material/Collections";
import SettingsIcon from "@mui/icons-material/Settings";
import type { SvgIconComponent } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import ProfileCard from "@/components/ProfileCard";
import type { ApiMe } from "@/api/me";

type SidebarSection = {
    key: string;
    label: string;
    icon: SvgIconComponent;
    title?: string;
    description?: string;
    to?: string;
    disabled?: boolean;
    items?: {
        label: string;
        to: string;
        icon?: SvgIconComponent;
        disabled?: boolean;
    }[];
};

const sidebarSections: SidebarSection[] = [
    {
        key: "home",
        label: "Home",
        icon: HomeIcon,
        items: [
            { label: "Overview", to: "/", icon: HomeIcon },
            { label: "DX Rating", to: "/dx-rating", icon: StarIcon, disabled: true },
            { label: "Record of maimai", to: "/maimai-record", icon: FormatListNumberedIcon, disabled: true },
        ],
    },
    {
        key: "playdata",
        label: "Player Data",
        icon: PersonIcon,
        disabled: true,
        items: [
            { label: "Player data", to: "/playdata", icon: BadgeIcon, disabled: true },
            { label: "Stamp card", to: "/playdata/stamp-card", icon: StyleIcon, disabled: true },
            { label: "Album", to: "/playdata/album", icon: CameraAltIcon, disabled: true },
        ],
    },
    {
        key: "friends",
        label: "Friends and Circles",
        icon: GroupIcon,
        disabled: true,
        items: [
            { label: "Friends", to: "/friends", icon: GroupIcon, disabled: true },
            { label: "Circles", to: "/circles", icon: GroupsIcon, disabled: true },
        ],
    },
    {
        key: "shop",
        label: "maimile Shop",
        icon: ShoppingBagIcon,
        disabled: true,
        to: "/shop",
    },
    {
        key: "title",
        label: "Records",
        icon: AssessmentIcon,
        disabled: true,
        items: [
            { label: "Game records", to: "/records/game", icon: FormatListNumberedIcon, disabled: true },
            { label: "Song scores", to: "/records/songs", icon: MusicNoteIcon, disabled: true },
            { label: "Courses", to: "/records/courses", icon: FlagIcon, disabled: true },
            { label: "World stats", to: "/records/worldstats", icon: PublicIcon, disabled: true },
        ],
    },
    {
        key: "event",
        label: "Events",
        icon: EventIcon,
        disabled: true,
        items: [
            { label: "Area", to: "/events/area", icon: FlagIcon, disabled: true },
            { label: "Event area", to: "/events/event-area", icon: EventIcon, disabled: true },
            { label: "End event area", to: "/events/end-event-area", icon: TodayIcon, disabled: true },
            { label: "Season info", to: "/events/season-info", icon: CalendarMonthIcon, disabled: true },
        ],
    },
    {
        key: "collections",
        label: "Collections",
        icon: CollectionsIcon,
        items: [
            { label: "Icon", to: "/collections/icon", icon: CollectionsIcon },
            { label: "Nameplate", to: "/collections/nameplate", icon: BadgeIcon },
            { label: "Frame", to: "/collections/frame", icon: StyleIcon },
            { label: "Title", to: "/collections/title", icon: MilitaryTechIcon },
            { label: "Tour member", to: "/collections/tour-member", icon: GroupIcon, disabled: true },
            { label: "Partner", to: "/collections/partner", icon: FavoriteIcon },
        ],
    },
    {
        key: "ranking",
        label: "Ranking",
        icon: LeaderboardIcon,
        disabled: true,
        items: [
            { label: "Song", to: "/ranking/song", icon: MusicNoteIcon, disabled: true },
            { label: "Course", to: "/ranking/course", icon: FlagIcon, disabled: true },
            { label: "Session", to: "/ranking/session", icon: CasinoIcon, disabled: true },
            { label: "DX", to: "/ranking/dx", icon: StarIcon, disabled: true },
            { label: "Total", to: "/ranking/total", icon: EmojiEventsIcon, disabled: true },
            { label: "Partner", to: "/ranking/partner", icon: FavoriteIcon, disabled: true },
        ],
    },
    {
        key: "settings",
        label: "Settings",
        icon: SettingsIcon,
        items: [
            { label: "Game options", to: "/settings/game", icon: SettingsApplicationsIcon },
            { label: "Player", to: "/settings/player", icon: PersonIcon },
            { label: "Favorite songs", to: "/settings/favorite-songs", icon: FavoriteIcon, disabled: true },
        ],
    },
];

export function createSidebarSectionState() {
    return sidebarSections.reduce<Record<string, boolean>>((state, section) => {
        state[section.key] = false;
        return state;
    }, {});
}

type SidebarProps = {
    profile: ApiMe;
    sectionsOpen: Record<string, boolean>;
    onToggleSection: (key: string) => void;
};

function Sidebar({ profile, sectionsOpen, onToggleSection }: SidebarProps) {
    return (
        <Box className={cls.sidebarContent}>
            <Box className={cls.sidebarHeader}>
                <ProfileCard d={profile} />
            </Box>

            <Divider />

            <List disablePadding dense className={cls.sidebarList}>
                {sidebarSections.map((item) => {
                    const isOpen = sectionsOpen[item.key] ?? false;
                    const SidebarIcon = item.icon;

                    if (!item.items) {
                        return (
                            <Box key={item.key}>
                                <ListItemButton component={NavLink} to={item.to ?? "/"} disabled={item.disabled}>
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
                            <ListItemButton onClick={() => onToggleSection(item.key)} disabled={item.disabled}>
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
                                            {item.title && <Typography variant="subtitle2">{item.title}</Typography>}
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
                                                disabled={subItem.disabled}
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
                <Box sx={{ flex: "1", minWidth: 0 }}></Box>
            </List>
        </Box>
    );
}

export default Sidebar;
