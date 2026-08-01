import {
    Box,
    Button,
    Card,
    CardActionArea,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
    type SxProps,
    type Theme,
} from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export type ImageOptionPickerOption = {
    value: string;
    label: string;
};

type ImageOptionPickerProps<Name extends string> = {
    name: Name;
    label: string;
    description?: string;
    options: ImageOptionPickerOption[];
    disabled: boolean;
    value: string;
    onChange: (name: Name, value: string) => void;
    getImageSrc: (option: ImageOptionPickerOption, index: number) => string;
    getOptionLabel?: (option: ImageOptionPickerOption) => string;
    imageAspectRatio?: string | number;
    sx?: SxProps<Theme>;
};

function ImageOptionPicker<Name extends string>({
    name,
    label,
    description,
    options,
    disabled,
    value,
    onChange,
    getImageSrc,
    getOptionLabel,
    imageAspectRatio,
    sx,
}: ImageOptionPickerProps<Name>) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const selectedOptionRef = useRef<HTMLDivElement>(null);
    const [showStartScrollHint, setShowStartScrollHint] = useState(false);
    const [showEndScrollHint, setShowEndScrollHint] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [draftValue, setDraftValue] = useState(value);

    // const selectedOption = useMemo(
    //     () => options.find((option) => option.value === value) ?? options[0],
    //     [options, value],
    // );

    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        const selectedOption = selectedOptionRef.current;

        if (!scroller || !selectedOption || scroller.scrollWidth <= scroller.clientWidth) {
            return;
        }

        const centeredScrollLeft = selectedOption.offsetLeft - (scroller.clientWidth - selectedOption.clientWidth) / 2;
        const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;

        scroller.scrollLeft = Math.min(Math.max(centeredScrollLeft, 0), maxScrollLeft);
    }, [options, value]);

    useEffect(() => {
        const scroller = scrollerRef.current;

        if (!scroller) {
            return;
        }

        const updateScrollHint = () => {
            const hasOverflow = scroller.scrollWidth > scroller.clientWidth;
            const isScrolledFromStart = scroller.scrollLeft > 1;
            const isScrolledToEnd = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1;

            setShowStartScrollHint(hasOverflow && isScrolledFromStart);
            setShowEndScrollHint(hasOverflow && !isScrolledToEnd);
        };

        updateScrollHint();
        scroller.addEventListener("scroll", updateScrollHint, { passive: true });

        const resizeObserver = new ResizeObserver(updateScrollHint);
        resizeObserver.observe(scroller);

        return () => {
            scroller.removeEventListener("scroll", updateScrollHint);
            resizeObserver.disconnect();
        };
    }, [options]);

    useEffect(() => {
        if (!dialogOpen) {
            setDraftValue(value);
        }
    }, [dialogOpen, value]);

    useEffect(() => {
        if (!dialogOpen) return;

        setDraftValue((currentValue) =>
            options.some((option) => option.value === currentValue) ? currentValue : value,
        );
    }, [dialogOpen, options, value]);

    const handleOpenDialog = () => {
        if (disabled) return;

        setDraftValue(value);
        setDialogOpen(true);
    };

    const handleCancelDialog = () => {
        setDraftValue(value);
        setDialogOpen(false);
    };

    const handleConfirmDialog = () => {
        if (draftValue !== value) {
            onChange(name, draftValue);
        }

        setDialogOpen(false);
    };

    return (
        <Box sx={[{ gridColumn: "1 / -1", minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
            <Stack spacing={1}>
                <Box onClick={handleOpenDialog} sx={{ cursor: disabled ? "default" : "pointer", width: "fit-content" }}>
                    <Typography
                        variant="subtitle2"
                        sx={{
                            textAlign: "justify",
                        }}
                    >
                        {label}&nbsp;
                        <OpenInNewIcon sx={{ fontSize: 14, pt: 0.3 }} fontSize="small" />
                    </Typography>
                    {description && (
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.75rem" }}>
                            {description}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ position: "relative", minWidth: 0 }}>
                    <Box
                        ref={scrollerRef}
                        sx={{ display: "flex", gap: 1.5, maxWidth: "100%", minWidth: 0, overflowX: "auto", pb: 1 }}
                    >
                        {options.map((option, index) => {
                            const selected = option.value === value;
                            const optionLabel = getOptionLabel?.(option) ?? option.label;

                            return (
                                <Card
                                    key={option.value}
                                    ref={selected ? selectedOptionRef : undefined}
                                    variant="outlined"
                                    sx={{
                                        borderColor: selected ? "primary.main" : "divider",
                                        borderWidth: selected ? 2 : 1,
                                        flex: "0 0 232px",
                                    }}
                                >
                                    <CardActionArea
                                        disabled={disabled}
                                        onClick={() => onChange(name, option.value)}
                                        sx={{ height: "100%" }}
                                    >
                                        <Box
                                            component="img"
                                            src={getImageSrc(option, index)}
                                            alt={optionLabel}
                                            draggable={false}
                                            loading="lazy"
                                            onError={(event) => {
                                                event.currentTarget.style.visibility = "hidden";
                                            }}
                                            sx={{
                                                aspectRatio: imageAspectRatio,
                                                bgcolor: "background.default",
                                                display: "block",
                                                objectFit: "contain",
                                                width: "100%",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                bgcolor: selected ? "primary.main" : "action.hover",
                                                px: 1,
                                                py: 0.75,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color={selected ? "gray" : "textPrimary"}
                                                sx={{ fontWeight: 700, textAlign: "center" }}
                                            >
                                                {optionLabel}
                                            </Typography>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            );
                        })}
                    </Box>
                    <Box
                        sx={{
                            background: (theme) =>
                                `linear-gradient(270deg, transparent, ${theme.palette.background.paper})`,
                            bottom: 1,
                            left: 0,
                            pointerEvents: "none",
                            position: "absolute",
                            top: 0,
                            width: 24,
                            opacity: 0,
                            visibility: "hidden",
                            transition: "opacity 0.2s, visibility 0.2s",
                            ...(showStartScrollHint
                                ? {
                                      opacity: 1,
                                      visibility: "visible",
                                  }
                                : {}),
                        }}
                    />
                    <Box
                        sx={{
                            background: (theme) =>
                                `linear-gradient(90deg, transparent, ${theme.palette.background.paper})`,
                            bottom: 1,
                            pointerEvents: "none",
                            position: "absolute",
                            right: 0,
                            top: 0,
                            width: 24,
                            opacity: 0,
                            visibility: "hidden",
                            transition: "opacity 0.2s, visibility 0.2s",
                            ...(showEndScrollHint
                                ? {
                                      opacity: 1,
                                      visibility: "visible",
                                  }
                                : {}),
                        }}
                    />
                </Box>
            </Stack>

            <Dialog open={dialogOpen} onClose={handleCancelDialog} fullWidth maxWidth="lg">
                <DialogTitle>{label}</DialogTitle>
                <DialogContent>
                    {description && (
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            {description}
                        </Typography>
                    )}

                    <Box
                        sx={{
                            display: "grid",
                            gap: 1.5,
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                                lg: "repeat(3, minmax(0, 1fr))",
                            },
                        }}
                    >
                        {options.map((option, index) => {
                            const selected = option.value === draftValue;
                            const optionLabel = getOptionLabel?.(option) ?? option.label;

                            return (
                                <Card
                                    key={option.value}
                                    variant="outlined"
                                    sx={{
                                        borderColor: selected ? "primary.main" : "divider",
                                        borderWidth: selected ? 2 : 1,
                                    }}
                                >
                                    <CardActionArea
                                        disabled={disabled}
                                        onClick={() => setDraftValue(option.value)}
                                        sx={{ height: "100%" }}
                                    >
                                        <Box
                                            component="img"
                                            src={getImageSrc(option, index)}
                                            alt={optionLabel}
                                            draggable={false}
                                            loading="lazy"
                                            onError={(event) => {
                                                event.currentTarget.style.visibility = "hidden";
                                            }}
                                            sx={{
                                                aspectRatio: imageAspectRatio,
                                                bgcolor: "background.default",
                                                display: "block",
                                                objectFit: "contain",
                                                width: "100%",
                                            }}
                                        />
                                        <Box
                                            sx={{
                                                bgcolor: selected ? "primary.main" : "action.hover",
                                                px: 1,
                                                py: 0.75,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color={selected ? "gray" : "textPrimary"}
                                                sx={{ fontWeight: 700, textAlign: "center" }}
                                            >
                                                {optionLabel}
                                            </Typography>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            );
                        })}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDialog}>{"Cancel"}</Button>
                    <Button variant="contained" onClick={handleConfirmDialog} disabled={draftValue === value}>
                        {"OK"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default ImageOptionPicker;
