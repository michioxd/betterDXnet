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
import { useTranslation } from "react-i18next";

type SidebarSection = {
    key: string;
    labelKey: string;
    icon: SvgIconComponent;
    titleKey?: string;
    descriptionKey?: string;
    to?: string;
    disabled?: boolean;
    items?: {
        labelKey: string;
        to: string;
        icon?: SvgIconComponent;
        disabled?: boolean;
    }[];
};

const sidebarSections: SidebarSection[] = [
    {
        key: "home",
        labelKey: "home",
        icon: HomeIcon,
        items: [
            { labelKey: "overview", to: "/", icon: HomeIcon },
            { labelKey: "dxRating", to: "/dx-rating", icon: StarIcon, disabled: true },
            { labelKey: "recordOfMaimai", to: "/maimai-record", icon: FormatListNumberedIcon, disabled: true },
        ],
    },
    {
        key: "title",
        labelKey: "records",
        icon: AssessmentIcon,
        disabled: false,
        items: [
            { labelKey: "Last 50 records", to: "/records/game", icon: FormatListNumberedIcon, disabled: false },
            { labelKey: "songScores", to: "/records/songs", icon: MusicNoteIcon, disabled: true },
            { labelKey: "courses", to: "/records/courses", icon: FlagIcon, disabled: true },
            { labelKey: "worldStats", to: "/records/worldstats", icon: PublicIcon, disabled: true },
        ],
    },
    {
        key: "playdata",
        labelKey: "playerData",
        icon: PersonIcon,
        disabled: false,
        items: [
            { labelKey: "playerDataItem", to: "/playdata", icon: BadgeIcon, disabled: true },
            { labelKey: "stampCard", to: "/playdata/stamp-card", icon: StyleIcon, disabled: true },
            { labelKey: "album", to: "/playdata/album", icon: CameraAltIcon },
        ],
    },
    {
        key: "friends",
        labelKey: "friendsAndCircles",
        icon: GroupIcon,
        disabled: true,
        items: [
            { labelKey: "friends", to: "/friends", icon: GroupIcon, disabled: true },
            { labelKey: "circles", to: "/circles", icon: GroupsIcon, disabled: true },
        ],
    },
    {
        key: "shop",
        labelKey: "maimileShop",
        icon: ShoppingBagIcon,
        disabled: true,
        to: "/shop",
    },
    {
        key: "event",
        labelKey: "events",
        icon: EventIcon,
        disabled: true,
        items: [
            { labelKey: "area", to: "/events/area", icon: FlagIcon, disabled: true },
            { labelKey: "eventArea", to: "/events/event-area", icon: EventIcon, disabled: true },
            { labelKey: "endEventArea", to: "/events/end-event-area", icon: TodayIcon, disabled: true },
            { labelKey: "seasonInfo", to: "/events/season-info", icon: CalendarMonthIcon, disabled: true },
        ],
    },
    {
        key: "collections",
        labelKey: "collections",
        icon: CollectionsIcon,
        items: [
            { labelKey: "icon", to: "/collections/icon", icon: CollectionsIcon },
            { labelKey: "nameplate", to: "/collections/nameplate", icon: BadgeIcon },
            { labelKey: "frame", to: "/collections/frame", icon: StyleIcon },
            { labelKey: "title", to: "/collections/title", icon: MilitaryTechIcon },
            { labelKey: "tourMember", to: "/collections/tour-member", icon: GroupIcon, disabled: true },
            { labelKey: "partner", to: "/collections/partner", icon: FavoriteIcon },
        ],
    },
    {
        key: "ranking",
        labelKey: "ranking",
        icon: LeaderboardIcon,
        disabled: true,
        items: [
            { labelKey: "song", to: "/ranking/song", icon: MusicNoteIcon, disabled: true },
            { labelKey: "course", to: "/ranking/course", icon: FlagIcon, disabled: true },
            { labelKey: "session", to: "/ranking/session", icon: CasinoIcon, disabled: true },
            { labelKey: "dx", to: "/ranking/dx", icon: StarIcon, disabled: true },
            { labelKey: "total", to: "/ranking/total", icon: EmojiEventsIcon, disabled: true },
            { labelKey: "partner", to: "/ranking/partner", icon: FavoriteIcon, disabled: true },
        ],
    },
    {
        key: "settings",
        labelKey: "settings",
        icon: SettingsIcon,
        items: [
            { labelKey: "gameOptions", to: "/settings/game", icon: SettingsApplicationsIcon },
            { labelKey: "player", to: "/settings/player", icon: PersonIcon },
            { labelKey: "favoriteSongs", to: "/settings/favorite-songs", icon: FavoriteIcon, disabled: true },
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
    const { t } = useTranslation("navigation");

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
                                    <ListItemText
                                        primary={t(item.labelKey)}
                                        secondary={item.titleKey ? t(item.titleKey) : undefined}
                                    />
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
                                <ListItemText
                                    primary={t(item.labelKey)}
                                    secondary={item.titleKey ? t(item.titleKey) : undefined}
                                />
                                {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItemButton>

                            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                <List disablePadding dense sx={{ pl: 2 }}>
                                    {(item.titleKey || item.descriptionKey) && (
                                        <Box sx={{ px: 2, py: 1 }}>
                                            {item.titleKey && (
                                                <Typography variant="subtitle2">{t(item.titleKey)}</Typography>
                                            )}
                                            {item.descriptionKey && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {t(item.descriptionKey)}
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
                                                <ListItemText primary={t(subItem.labelKey)} />
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
