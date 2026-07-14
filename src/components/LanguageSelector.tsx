import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    type ButtonProps,
    type IconButtonProps,
    type MenuProps,
} from "@mui/material";
import { useMemo, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import unknownFlag from "@/assets/unknown_flag.svg";
import { knownLocales } from "@/locales/list";

function getLangInfo(localeCode: string, fallbackName: string) {
    try {
        const region = new Intl.Locale(localeCode).maximize().region;
        const languageName = new Intl.DisplayNames([localeCode], { type: "language" }).of(localeCode);
        const emoji = region?.toUpperCase().replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 0x1f1a5));
        let flag = null;

        try {
            const locale = new Intl.Locale(localeCode).maximize();
            flag = `https://flagcdn.com/${locale.region?.toLowerCase()}.svg`;
        } catch {
            flag = null;
        }

        return { name: languageName, emoji, flag };
    } catch {
        return {
            name: fallbackName,
            emoji: "🇺🇸",
            flag: `https://flagcdn.com/us.svg`,
        };
    }
}

const LangItem = ({ lang }: { lang: (typeof knownLocales)[string] }) => {
    const { i18n, t } = useTranslation("layout");
    const fallbackName = t("language.fallbackName");
    const langInfo = useMemo(() => getLangInfo(lang.code4, fallbackName), [fallbackName, lang]);

    return (
        <MenuItem
            key={lang.code4}
            onClick={() => i18n.changeLanguage(lang.code4)}
            selected={i18n.language === lang.code4}
        >
            {langInfo.flag && (
                <Box
                    component="img"
                    sx={{ width: 20, height: 13.33333333333333, objectFit: "cover", mr: 1 }}
                    onError={(e) => {
                        e.currentTarget.src = unknownFlag;
                        e.currentTarget.onerror = null;
                    }}
                    src={langInfo.flag}
                    alt={langInfo.name}
                />
            )}
            <Typography sx={{ fontWeight: i18n.language === lang.code4 ? 700 : 400 }}>{langInfo.name}</Typography>
        </MenuItem>
    );
};

export function LangSelectorList(props: Omit<MenuProps, "children">) {
    return (
        <Menu {...props}>
            {Object.values(knownLocales).map((lc, index) => (
                <LangItem key={index} lang={lc} />
            ))}
        </Menu>
    );
}

export const LangSelectorComponent = (
    props: Omit<MenuProps, "anchorEl" | "children" | "onClose" | "open"> & {
        minimal?: boolean;
        buttonProps?: ButtonProps;
    },
) => {
    const { i18n, t } = useTranslation("layout");
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const fallbackName = t("language.fallbackName");
    const langInfo = useMemo(() => getLangInfo(i18n.language, fallbackName), [fallbackName, i18n.language]);
    const { minimal, buttonProps, ...menuProps } = props;
    const open = Boolean(anchorEl);

    const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            {minimal ? (
                <IconButton
                    size="large"
                    color="inherit"
                    edge="end"
                    onClick={handleOpen}
                    aria-label={langInfo.name}
                    {...(buttonProps as IconButtonProps)}
                >
                    <Box
                        sx={{ widht: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        {langInfo.flag && (
                            <Box
                                component="img"
                                sx={{ width: 20, height: 13.33333333333333, objectFit: "cover" }}
                                onError={(e) => {
                                    e.currentTarget.src = unknownFlag;
                                    e.currentTarget.onerror = null;
                                }}
                                src={langInfo.flag}
                                alt={langInfo.name}
                            />
                        )}
                    </Box>
                </IconButton>
            ) : (
                <Button size="small" variant="outlined" color="inherit" onClick={handleOpen} {...buttonProps}>
                    {langInfo.flag && (
                        <Box
                            component="img"
                            sx={{ width: 20, height: 13.33333333333333, objectFit: "cover", mr: 0.5 }}
                            onError={(e) => {
                                e.currentTarget.src = unknownFlag;
                                e.currentTarget.onerror = null;
                            }}
                            src={langInfo.flag}
                            alt={langInfo.name}
                        />
                    )}
                    {langInfo.name}
                    <ArrowDropDownIcon fontSize="small" />
                </Button>
            )}
            <LangSelectorList {...menuProps} anchorEl={anchorEl} open={open} onClose={handleClose} />
        </>
    );
};
