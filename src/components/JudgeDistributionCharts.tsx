import type { JudgeCount, JudgeTable } from "@/api/records/types";
import { Box, useTheme } from "@mui/material";
import { darken } from "@mui/material/styles";
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type JudgmentKey = keyof JudgeCount;
type NoteKey = keyof JudgeTable;
type NoteDistributionRow = { note: string; total: number } & Record<JudgmentKey, number> &
    Record<`${JudgmentKey}Count`, number>;

const judgments: Array<{ key: JudgmentKey; label: string; color: string }> = [
    { key: "criticalPerfect", label: "Critical Perfect", color: "#ffbc09" },
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
    return judgments.map((judgment) => ({
        judgment: judgment.label,
        total: notes.reduce((total, note) => total + data[note.key][judgment.key], 0),
        fill: getChartColor(judgment.color, isDarkMode),
    }));
}

export function JudgeDistributionChart({ data, height = 220 }: JudgeDistributionChartsProps) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const axisColor = theme.palette.text.secondary;
    const gridColor = theme.palette.divider;
    const tooltipStyle = {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        color: theme.palette.text.primary,
    };

    return (
        <Box sx={{ width: "100%", height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={buildNoteDistribution(data)}
                    layout="vertical"
                    margin={{ top: 16, right: 16, bottom: 8, left: 16 }}
                >
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: axisColor }} tickFormatter={formatPercent} />
                    <YAxis dataKey="note" type="category" width={56} tick={{ fill: axisColor }} />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: theme.palette.text.primary }}
                        formatter={(value, name, item) => {
                            const countKey = `${String(item.dataKey)}Count`;
                            const count = toNumber((item.payload as Record<string, unknown> | undefined)?.[countKey]);

                            return [`${formatPercent(value)} (${formatCount(count)})`, name];
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
                                    gap: 2,
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
                            fill={getJudgeColor(judgment.key, isDarkMode)}
                            radius={index === judgments.length - 1 ? [0, 8, 8, 0] : [0, 0, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
}

export function OverallJudgmentDistributionChart({ data, height = 320 }: JudgeDistributionChartsProps) {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const axisColor = theme.palette.text.secondary;
    const gridColor = theme.palette.divider;
    const tooltipStyle = {
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        color: theme.palette.text.primary,
    };

    return (
        <Box sx={{ width: "100%", height }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={buildOverallDistribution(data, isDarkMode)}
                    layout="vertical"
                    margin={{ top: 24, right: 48, bottom: 8, left: 0 }}
                >
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fill: axisColor }} tickFormatter={formatCount} />
                    <YAxis dataKey="judgment" type="category" width={112} tick={{ fill: axisColor }} />
                    <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={{ color: theme.palette.text.primary }}
                        formatter={(value) => formatCount(toNumber(value))}
                    />
                    <Bar dataKey="total" name="Total" radius={[0, 8, 8, 0]}>
                        <LabelList
                            dataKey="total"
                            position="right"
                            formatter={(value) => formatCount(toNumber(value))}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
}
