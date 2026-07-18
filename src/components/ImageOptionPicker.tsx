import { Box, Card, CardActionArea, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

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

    return (
        <Box sx={[{ gridColumn: "1 / -1", minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
            <Stack spacing={1}>
                <Box>
                    <Typography variant="subtitle2">{label}</Typography>
                    {description && (
                        <Typography variant="body2" color="textSecondary">
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
                    {showStartScrollHint && (
                        <Box
                            sx={{
                                background: (theme) =>
                                    `linear-gradient(270deg, transparent, ${theme.palette.background.paper})`,
                                bottom: 1,
                                left: 0,
                                pointerEvents: "none",
                                position: "absolute",
                                top: 0,
                                width: 32,
                            }}
                        />
                    )}
                    {showEndScrollHint && (
                        <Box
                            sx={{
                                background: (theme) =>
                                    `linear-gradient(90deg, transparent, ${theme.palette.background.paper})`,
                                bottom: 1,
                                pointerEvents: "none",
                                position: "absolute",
                                right: 0,
                                top: 0,
                                width: 32,
                            }}
                        />
                    )}
                </Box>
            </Stack>
        </Box>
    );
}

export default ImageOptionPicker;
