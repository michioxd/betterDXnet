import { Box, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
    Bar,
    BarChart,
    CartesianGrid,
    LabelList,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { SafeResponsiveContainer } from "./SafeResponsiveContainer";

export type AccuracyNoteType = "Tap" | "Hold" | "Slide" | "Touch" | "Break";

export interface AccuracyData {
    noteType: AccuracyNoteType;
    accuracy: number;
    totalNotes?: number;
}

interface AccuracyRadarChartProps {
    data: AccuracyData[];
    height?: number;
    zeroNoteBehavior?: "zero" | "omit";
}

const noteTypes: AccuracyNoteType[] = ["Tap", "Hold", "Slide", "Touch", "Break"];

function clampAccuracy(value: number) {
    if (!Number.isFinite(value)) return 0;

    return Math.min(100, Math.max(0, value));
}

function formatPercent(value: unknown) {
    const numberValue = typeof value === "number" ? value : Number(value) || 0;

    return `${numberValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`;
}

function buildChartData(data: AccuracyData[], zeroNoteBehavior: AccuracyRadarChartProps["zeroNoteBehavior"]) {
    const accuracyByNoteType = new Map(
        data.map((item) => [
            item.noteType,
            {
                accuracy: clampAccuracy(item.accuracy),
                totalNotes: item.totalNotes,
            },
        ]),
    );

    return noteTypes.flatMap((noteType) => {
        const item = accuracyByNoteType.get(noteType);

        if (item === undefined && zeroNoteBehavior === "omit") return [];

        return [{ noteType, accuracy: item?.accuracy ?? 0, totalNotes: item?.totalNotes ?? 0 }];
    });
}

function getRadiusDomain(data: AccuracyData[]) {
    const visibleAccuracies = data.flatMap((item) => (item.totalNotes === 0 ? [] : [item.accuracy]));
    const minAccuracy = Math.min(
        ...(visibleAccuracies.length > 0 ? visibleAccuracies : data.map((item) => item.accuracy)),
    );
    if (!Number.isFinite(minAccuracy)) return [98, 100] as const;

    const domainMin = Math.min(99, Math.max(0, Math.floor(minAccuracy - 2)));
    const domainMax = 100 + (100 - domainMin);

    return [domainMin, domainMax] as const;
}

function getTooltipPayload(payload: unknown) {
    if (!Array.isArray(payload) || payload.length === 0) return undefined;

    return payload[0] as { payload?: AccuracyData };
}

export function AccuracyRadarChart({ data, height = 320, zeroNoteBehavior = "zero" }: AccuracyRadarChartProps) {
    const { t } = useTranslation("records");
    const theme = useTheme();
    const axisColor = theme.palette.text.secondary;
    const gridColor = theme.palette.divider;
    const radarColor = theme.palette.primary.main;
    const chartData = buildChartData(data, zeroNoteBehavior);
    const radiusDomain = getRadiusDomain(chartData);

    return (
        <Box sx={{ width: "100%", height }}>
            <SafeResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} outerRadius="64%" margin={{ top: 44, right: 52, bottom: 40, left: 52 }}>
                    <PolarGrid stroke={gridColor} />
                    <PolarAngleAxis
                        dataKey="noteType"
                        tick={({ payload, x, y, textAnchor }) => {
                            const accuracy = chartData.find((item) => item.noteType === payload.value)?.accuracy ?? 0;
                            const verticalAnchor =
                                typeof y === "number" && y < height / 2 ? "text-after-edge" : "text-before-edge";

                            return (
                                <text
                                    x={x}
                                    y={y}
                                    textAnchor={textAnchor}
                                    dominantBaseline={verticalAnchor}
                                    fill={axisColor}
                                    fontSize={13}
                                    fontWeight={600}
                                >
                                    <tspan x={x} dy="-0.25em">
                                        {payload.value}
                                    </tspan>
                                    <tspan x={x} dy="1.25em" fill={theme.palette.text.disabled} fontSize={12}>
                                        {formatPercent(accuracy)}
                                    </tspan>
                                </text>
                            );
                        }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={radiusDomain}
                        tick={false}
                        axisLine={false}
                        tickFormatter={formatPercent}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: theme.shape.borderRadius,
                            color: theme.palette.text.primary,
                        }}
                        labelStyle={{ color: theme.palette.text.primary }}
                        formatter={(value) => [formatPercent(value), t("detail.labels.accuracyPercent")]}
                        labelFormatter={(_label, payload) => {
                            const item = getTooltipPayload(payload)?.payload;

                            return item
                                ? `${t("detail.labels.noteType")}: ${item.noteType}`
                                : t("detail.labels.noteType");
                        }}
                    />
                    <Radar
                        dataKey="accuracy"
                        name="Accuracy"
                        stroke={radarColor}
                        fill={radarColor}
                        fillOpacity={0.35}
                        isAnimationActive={false}
                        animationDuration={600}
                    />
                </RadarChart>
            </SafeResponsiveContainer>
        </Box>
    );
}

export function AccuracyByNoteTypeBarChart({ data, height = 320, zeroNoteBehavior = "zero" }: AccuracyRadarChartProps) {
    const { t } = useTranslation("records");
    const theme = useTheme();
    const axisColor = theme.palette.text.secondary;
    const gridColor = theme.palette.divider;
    const barColor = theme.palette.primary.main;
    const chartData = buildChartData(data, zeroNoteBehavior).sort((left, right) => right.accuracy - left.accuracy);

    return (
        <Box sx={{ width: "100%", height }}>
            <SafeResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    barCategoryGap={12}
                    margin={{ top: 20, right: 76, bottom: 12, left: 8 }}
                >
                    <CartesianGrid stroke={gridColor} strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fill: axisColor }}
                        tickFormatter={formatPercent}
                        allowDecimals
                    />
                    <YAxis dataKey="noteType" type="category" width={60} tick={{ fill: axisColor }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: theme.shape.borderRadius,
                            color: theme.palette.text.primary,
                        }}
                        labelStyle={{ color: theme.palette.text.primary }}
                        formatter={(value) => [formatPercent(value), t("detail.labels.accuracyPercent")]}
                        labelFormatter={(_label, payload) => {
                            const item = getTooltipPayload(payload)?.payload;

                            return item
                                ? `${t("detail.labels.noteType")}: ${item.noteType}`
                                : t("detail.labels.noteType");
                        }}
                    />
                    <Bar
                        dataKey="accuracy"
                        name="Accuracy"
                        radius={[0, 8, 8, 0]}
                        fill={barColor}
                        isAnimationActive={false}
                        animationDuration={600}
                    >
                        <LabelList
                            dataKey="accuracy"
                            position="right"
                            fill={axisColor}
                            formatter={(value) => formatPercent(value)}
                        />
                    </Bar>
                </BarChart>
            </SafeResponsiveContainer>
        </Box>
    );
}
