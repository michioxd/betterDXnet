import type { JudgeCount, JudgeTable } from "@/api/records/types";
import { Box, Paper, type Theme, useTheme } from "@mui/material";
import { darken } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type AccuracyLossNoteType = "Tap" | "Hold" | "Slide" | "Touch" | "Break";

export interface AccuracyLossData {
    noteType: AccuracyLossNoteType;
    loss: number;
    totalLossPercentage?: number;
}

export interface AccuracyLossChartProps {
    data: AccuracyLossData[];
    height?: number;
}

type JudgeKey = keyof JudgeCount;
type NoteKey = keyof JudgeTable;

const judgeAccuracyWeight: Record<JudgeKey, number> = {
    criticalPerfect: 1,
    perfect: 1,
    great: 0.8,
    good: 0.5,
    miss: 0,
};

const noteTypes: Array<{ key: NoteKey; label: AccuracyLossNoteType }> = [
    { key: "tap", label: "Tap" },
    { key: "hold", label: "Hold" },
    { key: "slide", label: "Slide" },
    { key: "touch", label: "Touch" },
    { key: "break", label: "Break" },
];

const judgments = Object.keys(judgeAccuracyWeight) as JudgeKey[];
const severityColors = {
    negligible: "#64748b",
    small: "#eab308",
    medium: "#f59e0b",
    large: "#ef4444",
} as const;

function toNumber(value: unknown) {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;

    return 0;
}

function formatPercent(value: unknown) {
    const numberValue = toNumber(value);
    return `${numberValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

function getTooltipStyle(theme: Theme) {
    return {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        color: theme.palette.text.primary,
        boxShadow: theme.shadows[4],
    };
}

function getNoteLoss(judgeCount: JudgeCount) {
    const total = judgments.reduce((sum, judgment) => sum + judgeCount[judgment], 0);
    if (total === 0) return 0;

    const weightedTotal = judgments.reduce(
        (sum, judgment) => sum + judgeCount[judgment] * judgeAccuracyWeight[judgment],
        0,
    );

    return (1 - weightedTotal / total) * 100;
}

function getSeverityColor(loss: number, maxLoss: number, isDarkMode: boolean) {
    const severity = maxLoss <= 0 ? 0 : Math.min(1, Math.max(0, loss / maxLoss));
    const color =
        severity >= 0.75
            ? severityColors.large
            : severity >= 0.4
              ? severityColors.medium
              : severity >= 0.08
                ? severityColors.small
                : severityColors.negligible;

    return isDarkMode ? darken(color, 0.18) : color;
}

export function calculateAccuracyLossByNoteType(judgeTable: JudgeTable): AccuracyLossData[] {
    const losses = noteTypes.map((note) => ({
        noteType: note.label,
        loss: getNoteLoss(judgeTable[note.key]),
    }));
    const totalLoss = losses.reduce((sum, item) => sum + item.loss, 0);

    return losses
        .map((item) => ({
            ...item,
            totalLossPercentage: totalLoss === 0 ? 0 : (item.loss / totalLoss) * 100,
        }))
        .sort((a, b) => b.loss - a.loss);
}

function prepareChartData(data: AccuracyLossData[]) {
    const sortedData = [...data].sort((a, b) => b.loss - a.loss);
    const totalLoss = sortedData.reduce((sum, item) => sum + item.loss, 0);

    return sortedData.map((item) => ({
        ...item,
        totalLossPercentage: item.totalLossPercentage ?? (totalLoss === 0 ? 0 : (item.loss / totalLoss) * 100),
    }));
}

function AccuracyLossTooltip({
    active,
    payload,
    label,
    noteTypeLabel,
    accuracyLossLabel,
    totalLossShareLabel,
}: {
    active?: boolean;
    payload?: Array<{ payload?: AccuracyLossData }>;
    label?: string;
    noteTypeLabel: string;
    accuracyLossLabel: string;
    totalLossShareLabel: string;
}) {
    if (!active || !payload?.length) return null;

    const item = payload[0].payload;
    if (!item) return null;

    return (
        <Paper variant="elevation" sx={{ display: "grid", gap: 0.5, p: 1 }}>
            <Box>
                {noteTypeLabel}: {label}
            </Box>
            <Box>
                {accuracyLossLabel}: {formatPercent(item.loss)}
            </Box>
            <Box>
                {totalLossShareLabel}: {formatPercent(item.totalLossPercentage)}
            </Box>
        </Paper>
    );
}

export function AccuracyLossChart({ data, height = 215 }: AccuracyLossChartProps) {
    const { t } = useTranslation("records");
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const axisColor = theme.palette.text.secondary;
    const gridColor = theme.palette.divider;
    const tooltipStyle = getTooltipStyle(theme);
    const chartData = prepareChartData(data);
    const maxLoss = Math.max(...chartData.map((item) => item.loss), 0);

    return (
        <Box sx={{ width: "100%", height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    barCategoryGap={18}
                    margin={{ top: 12, right: 76, bottom: 12, left: 8 }}
                >
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                        type="number"
                        domain={[0, "dataMax"]}
                        tick={{ fill: axisColor }}
                        tickFormatter={formatPercent}
                        allowDecimals
                    />
                    <YAxis dataKey="noteType" type="category" width={60} tick={{ fill: axisColor }} />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: theme.palette.text.primary }}
                        content={
                            <AccuracyLossTooltip
                                noteTypeLabel={t("detail.labels.noteType")}
                                accuracyLossLabel={t("detail.labels.accuracyLoss")}
                                totalLossShareLabel={t("detail.labels.totalLossShare")}
                            />
                        }
                    />
                    <Bar
                        dataKey="loss"
                        name="Accuracy loss"
                        radius={[0, 10, 10, 0]}
                        barSize={24}
                        animationDuration={700}
                    >
                        {chartData.map((entry) => (
                            <Cell key={entry.noteType} fill={getSeverityColor(entry.loss, maxLoss, isDarkMode)} />
                        ))}
                        <LabelList
                            dataKey="loss"
                            position="right"
                            fill={axisColor}
                            formatter={(value) => formatPercent(value)}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
}
