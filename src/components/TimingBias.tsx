import { Box, Chip, Tooltip, Typography, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface TimingBiasProps {
    fast: number;
    late: number;
}

const timingSegments = [
    { label: "Deep Late", color: "#ef4444" },
    { label: "Slight Late", color: "#fb923c" },
    { label: "Even", color: "#facc15" },
    { label: "Slight Fast", color: "#60a5fa" },
    { label: "Deep Fast", color: "#2563eb" },
] as const;

function clampBias(value: number) {
    if (!Number.isFinite(value)) return 0;

    return Math.min(1, Math.max(-1, value));
}

function calculateTimingBias(fast: number, late: number) {
    const total = fast + late;
    if (total === 0) return 0;

    return clampBias((fast - late) / total);
}

function formatPercent(value: number) {
    return `${Math.abs(value * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

function formatBiasLabel(value: number) {
    if (Math.abs(value) < 0.005) return "Even";

    const direction = value > 0 ? "Fast" : "Late";
    const sign = value > 0 ? "+" : "-";

    return `${sign}${formatPercent(value)} ${direction}`;
}

function clampTimingAdjustment(value: number) {
    return Math.min(2, Math.max(-2, value));
}

function formatTimingAdjustment(value: number) {
    return clampTimingAdjustment(value).toFixed(1);
}

function roundTimingAdjustment(value: number) {
    return Math.round(value * 10) / 10;
}

function getTimingAdjustmentRange(value: number) {
    const isFast = value > 0;
    const sign = isFast ? -1 : 1;
    const estimatedAdjustment = clampTimingAdjustment(roundTimingAdjustment(Math.abs(value) * 2));
    const minAdjustment = clampTimingAdjustment(Math.max(0.1, roundTimingAdjustment(estimatedAdjustment - 0.2)));
    const maxAdjustment = clampTimingAdjustment(
        Math.max(minAdjustment, roundTimingAdjustment(estimatedAdjustment + 0.2)),
    );

    return [sign * minAdjustment, sign * maxAdjustment] as const;
}

function getTimingAdjustmentSuggestion(value: number) {
    const absoluteBias = Math.abs(value);

    if (absoluteBias < 0.1) {
        return {
            messageKey: "detail.timingBias.suggestions.balanced",
            range: undefined,
        };
    }

    const isFast = value > 0;
    const direction = isFast ? "fast" : "late";
    const range = getTimingAdjustmentRange(value);

    if (absoluteBias < 0.25) {
        return {
            messageKey: `detail.timingBias.suggestions.${direction}.slight`,
            range,
        };
    }

    if (absoluteBias < 0.5) {
        return {
            messageKey: `detail.timingBias.suggestions.${direction}.moderate`,
            range,
        };
    }

    return {
        messageKey: `detail.timingBias.suggestions.${direction}.strong`,
        range,
    };
}

export function TimingBias({ fast, late }: TimingBiasProps) {
    const { t } = useTranslation("records");
    const theme = useTheme();
    const bias = calculateTimingBias(fast, late);
    const indicatorLeft = `${((bias + 1) / 2) * 100}%`;
    const biasLabel = formatBiasLabel(bias);
    const suggestion = getTimingAdjustmentSuggestion(bias);
    const tooltip = (
        <Box>
            <Typography variant="body2">
                {t("detail.labels.fast")}: {fast.toLocaleString()}
            </Typography>
            <Typography variant="body2">
                {t("detail.labels.late")}: {late.toLocaleString()}
            </Typography>
            <Typography variant="body2">
                {t("detail.labels.bias")}: {biasLabel}
            </Typography>
        </Box>
    );

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ mb: 2.5 }}>
                <Typography variant="h6">{t("detail.timingBias.title")}</Typography>
                <Typography variant="body2" color="textSecondary">
                    {t("detail.timingBias.summary", {
                        late: late.toLocaleString(),
                        fast: fast.toLocaleString(),
                        bias: biasLabel,
                    })}
                </Typography>
            </Box>

            <Tooltip
                arrow
                title={tooltip}
                slotProps={{
                    tooltip: {
                        sx: {
                            bgcolor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            color: theme.palette.text.primary,
                            boxShadow: theme.shadows[4],
                        },
                    },
                    arrow: {
                        sx: { color: theme.palette.background.paper },
                    },
                }}
            >
                <Box sx={{ pb: 1.25, cursor: "default" }}>
                    <Box sx={{ position: "relative", height: 22, mb: 1.5 }}>
                        <Box
                            sx={{
                                position: "absolute",
                                left: indicatorLeft,
                                top: -8,
                                transform: "translateX(-50%)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 0.25,
                                zIndex: 2,
                                filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.35))",
                                transition: theme.transitions.create("left", {
                                    duration: theme.transitions.duration.standard,
                                    easing: theme.transitions.easing.easeInOut,
                                }),
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    px: 0.75,
                                    py: 0.25,
                                    borderRadius: 999,
                                    bgcolor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    color: theme.palette.text.primary,
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {biasLabel}
                            </Typography>
                            <Box
                                sx={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: "11px solid transparent",
                                    borderRight: "11px solid transparent",
                                    borderTop: theme.palette.mode === "dark" ? "18px solid #fff" : "18px solid #111827",
                                }}
                            />
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            position: "relative",
                            display: "grid",
                            gridTemplateColumns: `repeat(${timingSegments.length}, minmax(0, 1fr))`,
                            height: 32,
                            overflow: "hidden",
                            borderRadius: 999,
                            border: `1px solid ${theme.palette.divider}`,
                            boxShadow:
                                theme.palette.mode === "dark" ? "inset 0 0 18px rgba(0,0,0,0.35)" : theme.shadows[1],
                        }}
                    >
                        {timingSegments.map((segment, index) => (
                            <Box
                                key={segment.label}
                                sx={{
                                    bgcolor: segment.color,
                                    opacity: theme.palette.mode === "dark" ? 0.84 : 1,
                                    borderRight:
                                        index === timingSegments.length - 1
                                            ? "none"
                                            : "1px solid rgba(255,255,255,0.42)",
                                }}
                            />
                        ))}
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                bottom: 0,
                                left: "50%",
                                width: 2,
                                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.78)",
                                boxShadow:
                                    theme.palette.mode === "dark"
                                        ? "0 0 8px rgba(255,255,255,0.45)"
                                        : "0 0 6px rgba(0,0,0,0.25)",
                                transform: "translateX(-50%)",
                                zIndex: 1,
                            }}
                        />
                    </Box>
                </Box>
            </Tooltip>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr auto 1fr",
                    alignItems: "center",
                    gap: 1,
                    color: theme.palette.text.secondary,
                    fontSize: 12,
                    mt: 1,
                }}
            >
                <Typography variant="caption" sx={{ justifySelf: "start" }}>
                    {t("detail.labels.late")}
                </Typography>
                <Box sx={{ width: { xs: 36, sm: 64 }, borderTop: `1px solid ${theme.palette.divider}` }} />
                <Typography variant="caption" sx={{ justifySelf: "center" }}>
                    {t("detail.timingBias.even")}
                </Typography>
                <Box sx={{ width: { xs: 36, sm: 64 }, borderTop: `1px solid ${theme.palette.divider}` }} />
                <Typography variant="caption" sx={{ justifySelf: "end" }}>
                    {t("detail.labels.fast")}
                </Typography>
            </Box>

            <Box
                sx={{
                    mt: 1.5,
                    p: 1.25,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.action.hover,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t("detail.timingBias.adjustmentSuggestion")}
                    </Typography>
                    {suggestion.range && (
                        <Chip
                            size="small"
                            label={t("detail.timingBias.timingABRange", {
                                range: suggestion.range.map(formatTimingAdjustment).join(" ~ "),
                            })}
                            sx={{ fontWeight: 700 }}
                        />
                    )}
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.75 }}>
                    {t(suggestion.messageKey)}
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 0.5 }}>
                    {t("detail.timingBias.disclaimer")}
                </Typography>
            </Box>
        </Box>
    );
}
