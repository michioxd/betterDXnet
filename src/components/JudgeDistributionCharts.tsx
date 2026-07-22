import type { JudgeCount, JudgeTable } from "@/api/records/types";
import { Box, type Theme, useTheme } from "@mui/material";
import { darken } from "@mui/material/styles";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Tooltip, XAxis, YAxis } from "recharts";
import { SafeResponsiveContainer } from "./SafeResponsiveContainer";

type JudgmentKey = keyof JudgeCount;
type NoteKey = keyof JudgeTable;
type NoteDistributionRow = { note: string; total: number } & Record<JudgmentKey, number> &
    Record<`${JudgmentKey}Count`, number>;
type OverallDistributionRow = { judgment: string; total: number; percentage: number; fill: string };

const judgments: Array<{ key: JudgmentKey; label: string; color: string }> = [
    { key: "criticalPerfect", label: "Critical Perfect", color: "#09ceff" },
    { key: "perfect", label: "Perfect", color: "#ff9d00" },
    { key: "great", label: "Great", color: "#f75ea3" },
    { key: "good", label: "Good", color: "#2fca4c" },
    { key: "miss", label: "Miss", color: "#8c8c8c" },
];

const notes: Array<{ key: NoteKey; label: string }> = [
    { key: "tap", label: "Tap" },
    { key: "hold", label: "Hold" },
    { key: "slide", label: "Slide" },
    { key: "touch", label: "Touch" },
    { key: "break", label: "Break" },
];

type JudgeDistributionChartsProps = {
    data: JudgeTable;
    height?: number;
};

function formatCount(value: number) {
    return value.toLocaleString();
}

function toNumber(value: unknown) {
    if (typeof value === "number") return value;
    if (typeof value === "string") return Number(value) || 0;

    return 0;
}

function formatPercent(value: unknown) {
    const numberValue = toNumber(value);
    return `${numberValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
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

function buildNoteDistribution(data: JudgeTable) {
    return notes.flatMap((note) => {
        const total = judgments.reduce((sum, judgment) => sum + data[note.key][judgment.key], 0);
        if (total === 0) return [];

        const row = { note: note.label, total } as NoteDistributionRow;

        judgments.forEach((judgment) => {
            const count = data[note.key][judgment.key];
            row[judgment.key] = (count / total) * 100;
            row[`${judgment.key}Count`] = count;
        });

        return [row];
    });
}

function getChartColor(color: string, isDarkMode: boolean) {
    return isDarkMode ? darken(color, 0.22) : color;
}

export function getJudgeColor(key: JudgmentKey, isDarkMode: boolean) {
    return getChartColor(judgments.find((judgment) => judgment.key === key)?.color ?? "#8c8c8c", isDarkMode);
}

function buildOverallDistribution(data: JudgeTable, isDarkMode: boolean) {
    const grandTotal = notes.reduce(
        (noteTotal, note) => noteTotal + judgments.reduce((total, judgment) => total + data[note.key][judgment.key], 0),
        0,
    );

    return judgments.map((judgment) => ({
        judgment: judgment.label,
        total: notes.reduce((total, note) => total + data[note.key][judgment.key], 0),
        percentage:
            grandTotal === 0
                ? 0
                : (notes.reduce((total, note) => total + data[note.key][judgment.key], 0) / grandTotal) * 100,
        fill: getChartColor(judgment.color, isDarkMode),
    }));
}

function getJudgmentLabel(key: string) {
    return judgments.find((judgment) => judgment.key === key)?.label ?? key;
}

export function JudgeDistributionChart({ data, height = 280 }: JudgeDistributionChartsProps) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const axisColor = theme.palette.text.secondary;
    const gridColor = theme.palette.divider;
    const tooltipStyle = getTooltipStyle(theme);

    return (
        <Box sx={{ width: "100%", height }}>
            <SafeResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={buildNoteDistribution(data)}
                    layout="vertical"
                    barCategoryGap={10}
                    margin={{ top: 16, right: 24, bottom: 12, left: 8 }}
                >
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: axisColor }} tickFormatter={formatPercent} />
                    <YAxis dataKey="note" type="category" width={60} tick={{ fill: axisColor }} />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: theme.palette.text.primary }}
                        formatter={(value, name, item) => {
                            const countKey = `${String(item.dataKey)}Count`;
                            const payload = item.payload as Record<string, unknown> | undefined;
                            const count = toNumber(payload?.[countKey]);
                            const total = toNumber(payload?.total);

                            return [
                                `${formatCount(count)} / ${formatCount(total)} (${formatPercent(value)})`,
                                getJudgmentLabel(String(item.dataKey ?? name)),
                            ];
                        }}
                    />
                    <Legend
                        content={() => (
                            <Box
                                component="ul"
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    justifyContent: "center",
                                    gap: 1.5,
                                    m: 0,
                                    p: 0,
                                    listStyle: "none",
                                    color: axisColor,
                                    fontSize: 12,
                                }}
                            >
                                {judgments.map((judgment) => (
                                    <Box
                                        key={judgment.key}
                                        component="li"
                                        sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                                    >
                                        <Box
                                            component="span"
                                            sx={{
                                                width: 14,
                                                height: 14,
                                                borderRadius: 0.5,
                                                backgroundColor: getJudgeColor(judgment.key, isDarkMode),
                                            }}
                                        />
                                        {judgment.label}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    />
                    {judgments.map((judgment, index) => (
                        <Bar
                            key={judgment.key}
                            dataKey={judgment.key}
                            name={judgment.label}
                            stackId="judgment"
                            barSize={24}
                            fill={getJudgeColor(judgment.key, isDarkMode)}
                            radius={index === judgments.length - 1 ? [0, 8, 8, 0] : [0, 0, 0, 0]}
                            isAnimationActive={false}
                            animationDuration={600}
                        />
                    ))}
                </BarChart>
            </SafeResponsiveContainer>
        </Box>
    );
}

export function OverallJudgmentDistributionChart({ data, height = 320 }: JudgeDistributionChartsProps) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const axisColor = theme.palette.text.secondary;
    const gridColor = theme.palette.divider;
    const tooltipStyle = getTooltipStyle(theme);
    const chartData = buildOverallDistribution(data, isDarkMode);

    return (
        <Box sx={{ width: "100%", height }}>
            <SafeResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    barCategoryGap={12}
                    margin={{ top: 20, right: 72, bottom: 12, left: 8 }}
                >
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fill: axisColor }} tickFormatter={formatCount} allowDecimals={false} />
                    <YAxis dataKey="judgment" type="category" width={124} tick={{ fill: axisColor }} />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: theme.palette.text.primary }}
                        formatter={(value, _name, item) => {
                            const payload = item.payload as OverallDistributionRow | undefined;

                            return [`${formatCount(toNumber(value))} (${formatPercent(payload?.percentage)})`, "Total"];
                        }}
                    />
                    <Bar
                        dataKey="total"
                        name="Total"
                        radius={[0, 8, 8, 0]}
                        isAnimationActive={false}
                        animationDuration={600}
                    >
                        {chartData.map((entry) => (
                            <Cell key={entry.judgment} fill={entry.fill} />
                        ))}
                        <LabelList
                            dataKey="total"
                            position="right"
                            fill={axisColor}
                            formatter={(value) => formatCount(toNumber(value))}
                        />
                    </Bar>
                </BarChart>
            </SafeResponsiveContainer>
        </Box>
    );
}
