import {
    currentGameOptions,
    updateGameOptions,
    type GameOptionName,
    type GameOptionSelectOption,
    type GameOptionValues,
} from "@/api/options";
import ImageOptionPicker from "@/components/ImageOptionPicker";
import { rootStore } from "@/stores/root";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import {
    Alert,
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

type OptionSelectProps = {
    name: GameOptionName;
    label: string;
    description: string;
    options: GameOptionSelectOption[];
    disabled: boolean;
    value: string;
    onChange: (name: GameOptionName, value: string) => void;
};

type OptionSectionProps = {
    title: string;
    children: ReactNode;
};

type OptionSliderProps = {
    name: GameOptionName;
    label: string;
    description: string;
    options: GameOptionSelectOption[];
    disabled: boolean;
    value: string;
    onChange: (name: GameOptionName, value: string) => void;
};

type OptionKindCardSelectorProps = {
    name: GameOptionName;
    options: GameOptionSelectOption[];
    disabled: boolean;
    value: string;
    onChange: (name: GameOptionName, value: string) => void;
};

type OptionKindPreset = {
    tone: "success" | "warning" | "error" | "secondary";
};

type GameOptionChoices = Partial<Record<GameOptionName, GameOptionSelectOption[]>>;

const optionKindPresets: Record<string, OptionKindPreset> = {
    "0": {
        tone: "success",
    },
    "1": {
        tone: "warning",
    },
    "2": {
        tone: "error",
    },
    "3": {
        tone: "secondary",
    },
};

const dispJudgeLabels = [
    "TYPE1-A",
    "TYPE1-B",
    "TYPE1-C",
    "TYPE1-D",
    "TYPE1-E",
    "TYPE2-A",
    "TYPE2-B",
    "TYPE2-C",
    "TYPE2-D",
    "TYPE2-E",
    "TYPE2-F",
    "TYPE3-B",
    "TYPE3-C",
    "TYPE3-D",
    "TYPE4-E",
];

function OptionSection({ title, children }: OptionSectionProps) {
    return (
        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1.5, overflow: "hidden" }}>
            <Box sx={{ bgcolor: "action.hover", px: 2, py: 1.25 }}>
                <Typography variant="subtitle1">{title}</Typography>
            </Box>
            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                    p: 2,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

function OptionSelect({ name, label, description, options, disabled, value, onChange }: OptionSelectProps) {
    return (
        <Box>
            <FormControl fullWidth disabled={disabled}>
                <InputLabel id={`${name}-label`}>{label}</InputLabel>
                <Select
                    labelId={`${name}-label`}
                    label={label}
                    value={value}
                    onChange={(event) => onChange(name, event.target.value)}
                >
                    {options.map((selectOption) => (
                        <MenuItem key={selectOption.value} value={selectOption.value}>
                            {selectOption.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            {description && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    {description}
                </Typography>
            )}
        </Box>
    );
}

function OptionSlider({ name, label, description, options, disabled, value, onChange }: OptionSliderProps) {
    const sliderValue = Number(value);
    const lastOption = options[options.length - 1];
    const min = Number(options[0]?.value ?? 0);
    const max = Number(lastOption?.value ?? 0);
    const currentOption = options.find((option) => option.value === value);

    return (
        <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
                <Typography variant="subtitle2">{label}</Typography>
                <Typography variant="body2" color="textSecondary">
                    {currentOption?.label ?? value}
                </Typography>
            </Stack>
            <Slider
                disabled={disabled}
                value={Number.isFinite(sliderValue) ? sliderValue : min}
                min={min}
                max={max}
                step={1}
                marks={
                    [
                        // { value: min, label: options[0]?.label },
                        // { value: max, label: lastOption?.label },
                    ]
                }
                valueLabelDisplay="auto"
                valueLabelFormat={(sliderValue) =>
                    options.find((option) => option.value === String(sliderValue))?.label ?? sliderValue
                }
                onChange={(_, sliderValue) => onChange(name, String(sliderValue))}
            />
            {description && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    {description}
                </Typography>
            )}
        </Box>
    );
}

function OptionKindCardSelector({ name, options, disabled, value, onChange }: OptionKindCardSelectorProps) {
    const { t } = useTranslation("settings");

    return (
        <Box sx={{ gridColumn: "1 / -1" }}>
            <Box
                sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                }}
            >
                {options.map((selectOption) => {
                    const preset = optionKindPresets[selectOption.value] ?? optionKindPresets["3"];
                    const selected = selectOption.value === value;

                    return (
                        <Card
                            key={selectOption.value}
                            variant="outlined"
                            elevation={selected ? 6 : 0}
                            sx={(theme) => ({
                                bgcolor: selected
                                    ? `color-mix(in srgb, ${theme.palette[preset.tone].main} 14%, transparent)`
                                    : `color-mix(in srgb, ${theme.palette[preset.tone].main} 2%, transparent)`,
                                borderColor: selected ? `${preset.tone}.main` : "divider",
                                transition: theme.transitions.create([
                                    "background-color",
                                    "border-color",
                                    "box-shadow",
                                ]),
                            })}
                        >
                            <CardActionArea
                                disabled={disabled}
                                onClick={() => onChange(name, selectOption.value)}
                                sx={{ height: "100%" }}
                            >
                                <CardContent sx={{ height: "100%" }}>
                                    <Stack sx={{ height: "100%" }}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            sx={{ alignItems: "center", justifyContent: "space-between" }}
                                        >
                                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                                {t(`game.presets.${selectOption.value}.title`)}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="textSecondary">
                                            {t(`game.presets.${selectOption.value}.recommendation`)}
                                        </Typography>
                                        <Box sx={{ flexGrow: 1 }} />
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
}

const defaultGameOptionValues: GameOptionValues = {
    optionKind: "3",
    noteSpeed: "23",
    touchSpeed: "22",
    slideSpeed: "16",
    trackSkip: "1",
    mirrorMode: "0",
    starRotate: "0",
    adjustTiming: "22",
    judgeTiming: "33",
    brightness: "0",
    touchEffect: "2",
    dispCenter: "0",
    outFrameType: "3",
    dispJudge: "11",
    dispJudgePos: "5",
    dispJudgeTouchPos: "1",
    dispChain: "1",
    submonitorAchieve: "1",
    dispRate: "7",
    submonitorAppeal: "0",
    tapDesign: "0",
    holdDesign: "0",
    slideDesign: "0",
    starType: "0",
    outlineDesign: "3",
    ansVolume: "3",
    tapSe: "0",
    criticalSe: "0",
    tapHoldVolume: "2",
    breakSe: "0",
    breakVolume: "4",
    exSe: "0",
    exVolume: "3",
    slideSe: "0",
    slideVolume: "2",
    breakSlideVolume: "2",
    touchVolume: "2",
    touchHoldVolume: "2",
    damageSeVolume: "2",
};

function valuesKey(values: GameOptionValues) {
    return JSON.stringify(Object.entries(values).sort(([left], [right]) => left.localeCompare(right)));
}

function getOptionChoices(choices: GameOptionChoices, name: GameOptionName) {
    return choices[name] ?? [];
}

function PageSettingsGame() {
    const { t } = useTranslation("settings");
    const { app } = rootStore;
    const [values, setValues] = useState<GameOptionValues>(defaultGameOptionValues);
    const [initialValues, setInitialValues] = useState<GameOptionValues>(defaultGameOptionValues);
    const [choices, setChoices] = useState<GameOptionChoices>({});
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        app.setGlobalLoading(loading || saving);
    }, [app, loading, saving]);

    useEffect(() => {
        let disposed = false;

        const loadGameOptions = async () => {
            setLoading(true);
            setError(null);

            try {
                const currentOptions = await currentGameOptions();

                if (disposed) return;

                const loadedValues = { ...defaultGameOptionValues, ...currentOptions.values };
                const loadedChoices = currentOptions.sections.reduce<GameOptionChoices>((currentChoices, section) => {
                    section.options.forEach((option) => {
                        currentChoices[option.name] = option.options;
                    });

                    return currentChoices;
                }, {});

                setValues(loadedValues);
                setInitialValues(loadedValues);
                setChoices(loadedChoices);
                setToken(currentOptions.token);
            } catch (error) {
                if (disposed) return;

                setError(error as Error);
            } finally {
                if (disposed) return;

                setLoading(false);
            }
        };

        void loadGameOptions();

        return () => {
            disposed = true;
        };
    }, []);

    const isChanged = useMemo(() => valuesKey(values) !== valuesKey(initialValues), [values, initialValues]);

    const handleChange = (name: keyof GameOptionValues, value: string) => {
        setValues((currentValues) => ({
            ...currentValues,
            [name]: value,
        }));
    };

    const handleReset = () => {
        setValues(initialValues);
        setSuccessMessage(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            if (!token) {
                throw new Error(t("game.tokenNotFound"));
            }

            await updateGameOptions(values, token);
            setInitialValues(values);
            setSuccessMessage(t("game.updated"));
        } catch (error) {
            setError(error as Error);
        } finally {
            setSaving(false);
        }
    };

    const isDetailsMode = (values.optionKind ?? "3") === "3";

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5">{t("game.title")}</Typography>
                <Typography color="textSecondary">{t("game.description")}</Typography>
            </Box>

            {error && <Alert severity="error">{error.message}</Alert>}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <SettingsApplicationsIcon color="primary" />
                            <Typography variant="h6">{t("game.cardTitle")}</Typography>
                            {(loading || saving) && <CircularProgress size={18} />}
                        </Stack>

                        <Divider />

                        {loading ? (
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <CircularProgress size={20} />
                                <Typography color="textSecondary">{t("game.loading")}</Typography>
                            </Stack>
                        ) : (
                            <Stack spacing={1.5}>
                                <OptionSection title={t("game.sections.presets")}>
                                    <OptionKindCardSelector
                                        name="optionKind"
                                        options={getOptionChoices(choices, "optionKind")}
                                        disabled={saving}
                                        value={values.optionKind ?? "3"}
                                        onChange={handleChange}
                                    />
                                </OptionSection>

                                {isDetailsMode && (
                                    <>
                                        <OptionSection title={t("game.sections.speed")}>
                                            <OptionSlider
                                                name="noteSpeed"
                                                label={t("game.options.noteSpeed.label")}
                                                description={t("game.options.noteSpeed.description")}
                                                options={getOptionChoices(choices, "noteSpeed")}
                                                disabled={saving}
                                                value={values.noteSpeed ?? "23"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="touchSpeed"
                                                label={t("game.options.touchSpeed.label")}
                                                description={t("game.options.touchSpeed.description")}
                                                options={getOptionChoices(choices, "touchSpeed")}
                                                disabled={saving}
                                                value={values.touchSpeed ?? "22"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="slideSpeed"
                                                label={t("game.options.slideSpeed.label")}
                                                description={t("game.options.slideSpeed.description")}
                                                options={getOptionChoices(choices, "slideSpeed")}
                                                disabled={saving}
                                                value={values.slideSpeed ?? "16"}
                                                onChange={handleChange}
                                            />
                                        </OptionSection>

                                        <OptionSection title={t("game.sections.game")}>
                                            <OptionSlider
                                                name="adjustTiming"
                                                label={t("game.options.adjustTiming.label")}
                                                description={t("game.options.adjustTiming.description")}
                                                options={getOptionChoices(choices, "adjustTiming")}
                                                disabled={saving}
                                                value={values.adjustTiming ?? "22"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="judgeTiming"
                                                label={t("game.options.judgeTiming.label")}
                                                description={t("game.options.judgeTiming.description")}
                                                options={getOptionChoices(choices, "judgeTiming")}
                                                disabled={saving}
                                                value={values.judgeTiming ?? "33"}
                                                onChange={handleChange}
                                            />
                                            <Box sx={{ gridColumn: "1 / -1" }}>
                                                <OptionSlider
                                                    name="brightness"
                                                    label={t("game.options.brightness.label")}
                                                    description={t("game.options.brightness.description")}
                                                    options={getOptionChoices(choices, "brightness")}
                                                    disabled={saving}
                                                    value={values.brightness ?? "0"}
                                                    onChange={handleChange}
                                                />
                                            </Box>

                                            <ImageOptionPicker
                                                name="trackSkip"
                                                label={t("game.options.trackSkip.label")}
                                                description={t("game.options.trackSkip.description")}
                                                options={getOptionChoices(choices, "trackSkip")}
                                                disabled={saving}
                                                value={values.trackSkip ?? "1"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/b05/UI_OPT_B_05_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />
                                            <ImageOptionPicker
                                                name="mirrorMode"
                                                label={t("game.options.mirrorMode.label")}
                                                description={t("game.options.mirrorMode.description")}
                                                options={getOptionChoices(choices, "mirrorMode")}
                                                disabled={saving}
                                                value={values.mirrorMode ?? "0"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/b06/UI_OPT_B_06_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />
                                            <ImageOptionPicker
                                                name="starRotate"
                                                label={t("game.options.starRotate.label")}
                                                description={t("game.options.starRotate.description")}
                                                options={getOptionChoices(choices, "starRotate")}
                                                disabled={saving}
                                                value={values.starRotate ?? "0"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/b08/UI_OPT_B_08_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />
                                            <ImageOptionPicker
                                                name="touchEffect"
                                                label={t("game.options.touchEffect.label")}
                                                description={t("game.options.touchEffect.description")}
                                                options={getOptionChoices(choices, "touchEffect")}
                                                disabled={saving}
                                                value={values.touchEffect ?? "2"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/b10/UI_OPT_B_10_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />
                                        </OptionSection>

                                        <OptionSection title={t("game.sections.display")}>
                                            <ImageOptionPicker
                                                name="outFrameType"
                                                label={t("game.options.outFrameType.label")}
                                                description={t("game.options.outFrameType.description")}
                                                options={getOptionChoices(choices, "outFrameType")}
                                                disabled={saving}
                                                value={values.outFrameType ?? "3"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/f34/UI_OPT_F_34_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />

                                            <ImageOptionPicker
                                                name="dispJudgePos"
                                                label={t("game.options.dispJudgePos.label")}
                                                description={t("game.options.dispJudgePos.description")}
                                                options={getOptionChoices(choices, "dispJudgePos")}
                                                disabled={saving}
                                                value={values.dispJudgePos ?? "5"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/c16/UI_OPT_C_16_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />
                                            <ImageOptionPicker
                                                name="dispJudgeTouchPos"
                                                label={t("game.options.dispJudgeTouchPos.label")}
                                                description={t("game.options.dispJudgeTouchPos.description")}
                                                options={getOptionChoices(choices, "dispJudgeTouchPos")}
                                                disabled={saving}
                                                value={values.dispJudgeTouchPos ?? "1"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/c17/UI_OPT_C_17_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />

                                            <ImageOptionPicker
                                                name="dispCenter"
                                                label={t("game.options.dispCenter.label")}
                                                description={t("game.options.dispCenter.description")}
                                                options={getOptionChoices(choices, "dispCenter")}
                                                disabled={saving}
                                                value={values.dispCenter ?? "0"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/b04/UI_OPT_B_04_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />

                                            <ImageOptionPicker
                                                name="dispChain"
                                                label={t("game.options.dispChain.label")}
                                                description={t("game.options.dispChain.description")}
                                                options={getOptionChoices(choices, "dispChain")}
                                                disabled={saving}
                                                value={values.dispChain ?? "1"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/b12/UI_OPT_B_12_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />

                                            <ImageOptionPicker
                                                name="dispRate"
                                                label={t("game.options.dispRate.label")}
                                                description={t("game.options.dispRate.description")}
                                                options={getOptionChoices(choices, "dispRate")}
                                                disabled={saving}
                                                value={values.dispRate ?? "7"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/b11/UI_OPT_B_11_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />

                                            <ImageOptionPicker
                                                name="submonitorAchieve"
                                                label={t("game.options.submonitorAchieve.label")}
                                                description={t("game.options.submonitorAchieve.description")}
                                                options={getOptionChoices(choices, "submonitorAchieve")}
                                                disabled={saving}
                                                value={values.submonitorAchieve ?? "1"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/b13/UI_OPT_B_13_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />

                                            <ImageOptionPicker
                                                name="submonitorAppeal"
                                                label={t("game.options.submonitorAppeal.label")}
                                                description={t("game.options.submonitorAppeal.description")}
                                                options={getOptionChoices(choices, "submonitorAppeal")}
                                                disabled={saving}
                                                value={values.submonitorAppeal ?? "0"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/b14/UI_OPT_B_14_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />

                                            <ImageOptionPicker
                                                name="dispJudge"
                                                label={t("game.options.dispJudge.label")}
                                                description={t("game.options.dispJudge.description")}
                                                options={getOptionChoices(choices, "dispJudge")}
                                                disabled={saving}
                                                value={values.dispJudge ?? "11"}
                                                onChange={handleChange}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(option) =>
                                                    `https://maimaidx-eng.com/maimai-mobile/img/option/disp_judge_${option.value}.png`
                                                }
                                                getOptionLabel={(option) =>
                                                    dispJudgeLabels[Number(option.value)] ?? option.label
                                                }
                                            />
                                        </OptionSection>

                                        <OptionSection title={t("game.sections.design")}>
                                            <ImageOptionPicker
                                                name="tapDesign"
                                                label={t("game.options.tapDesign.label")}
                                                description={t("game.options.tapDesign.description")}
                                                options={getOptionChoices(choices, "tapDesign")}
                                                disabled={saving}
                                                value={values.tapDesign ?? "0"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/d18/UI_OPT_D_18_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />
                                            <ImageOptionPicker
                                                name="holdDesign"
                                                label={t("game.options.holdDesign.label")}
                                                description={t("game.options.holdDesign.description")}
                                                options={getOptionChoices(choices, "holdDesign")}
                                                disabled={saving}
                                                value={values.holdDesign ?? "0"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/d19/UI_OPT_D_19_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />
                                            <ImageOptionPicker
                                                name="slideDesign"
                                                label={t("game.options.slideDesign.label")}
                                                description={t("game.options.slideDesign.description")}
                                                options={getOptionChoices(choices, "slideDesign")}
                                                disabled={saving}
                                                value={values.slideDesign ?? "0"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/d20/UI_OPT_D_20_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />
                                            <ImageOptionPicker
                                                name="starType"
                                                label={t("game.options.starType.label")}
                                                description={t("game.options.starType.description")}
                                                options={getOptionChoices(choices, "starType")}
                                                disabled={saving}
                                                value={values.starType ?? "0"}
                                                onChange={handleChange}
                                                sx={{ gridColumn: "auto" }}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/d21/UI_OPT_D_21_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />
                                            <ImageOptionPicker
                                                name="outlineDesign"
                                                label={t("game.options.outlineDesign.label")}
                                                description={t("game.options.outlineDesign.description")}
                                                options={getOptionChoices(choices, "outlineDesign")}
                                                disabled={saving}
                                                value={values.outlineDesign ?? "3"}
                                                onChange={handleChange}
                                                imageAspectRatio="312 / 116"
                                                getImageSrc={(_, index) =>
                                                    `https://michioxd.ch/betterDXnet-resources/images/options/d22/UI_OPT_D_22_${String(index + 1).padStart(2, "0")}.png`
                                                }
                                            />
                                        </OptionSection>

                                        <OptionSection title={t("game.sections.sound")}>
                                            <OptionSlider
                                                name="ansVolume"
                                                label={t("game.options.ansVolume.label")}
                                                description={t("game.options.ansVolume.description")}
                                                options={getOptionChoices(choices, "ansVolume")}
                                                disabled={saving}
                                                value={values.ansVolume ?? "3"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="tapSe"
                                                label={t("game.options.tapSe.label")}
                                                description={t("game.options.tapSe.description")}
                                                options={getOptionChoices(choices, "tapSe")}
                                                disabled={saving}
                                                value={values.tapSe ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="criticalSe"
                                                label={t("game.options.criticalSe.label")}
                                                description={t("game.options.criticalSe.description")}
                                                options={getOptionChoices(choices, "criticalSe")}
                                                disabled={saving}
                                                value={values.criticalSe ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="tapHoldVolume"
                                                label={t("game.options.tapHoldVolume.label")}
                                                description={t("game.options.tapHoldVolume.description")}
                                                options={getOptionChoices(choices, "tapHoldVolume")}
                                                disabled={saving}
                                                value={values.tapHoldVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="breakSe"
                                                label={t("game.options.breakSe.label")}
                                                description={t("game.options.breakSe.description")}
                                                options={getOptionChoices(choices, "breakSe")}
                                                disabled={saving}
                                                value={values.breakSe ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="breakVolume"
                                                label={t("game.options.breakVolume.label")}
                                                description={t("game.options.breakVolume.description")}
                                                options={getOptionChoices(choices, "breakVolume")}
                                                disabled={saving}
                                                value={values.breakVolume ?? "4"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="exSe"
                                                label={t("game.options.exSe.label")}
                                                description={t("game.options.exSe.description")}
                                                options={getOptionChoices(choices, "exSe")}
                                                disabled={saving}
                                                value={values.exSe ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="exVolume"
                                                label={t("game.options.exVolume.label")}
                                                description={t("game.options.exVolume.description")}
                                                options={getOptionChoices(choices, "exVolume")}
                                                disabled={saving}
                                                value={values.exVolume ?? "3"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="slideSe"
                                                label={t("game.options.slideSe.label")}
                                                description={t("game.options.slideSe.description")}
                                                options={getOptionChoices(choices, "slideSe")}
                                                disabled={saving}
                                                value={values.slideSe ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="slideVolume"
                                                label={t("game.options.slideVolume.label")}
                                                description={t("game.options.slideVolume.description")}
                                                options={getOptionChoices(choices, "slideVolume")}
                                                disabled={saving}
                                                value={values.slideVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="breakSlideVolume"
                                                label={t("game.options.breakSlideVolume.label")}
                                                description={t("game.options.breakSlideVolume.description")}
                                                options={getOptionChoices(choices, "breakSlideVolume")}
                                                disabled={saving}
                                                value={values.breakSlideVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="touchVolume"
                                                label={t("game.options.touchVolume.label")}
                                                description={t("game.options.touchVolume.description")}
                                                options={getOptionChoices(choices, "touchVolume")}
                                                disabled={saving}
                                                value={values.touchVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="touchHoldVolume"
                                                label={t("game.options.touchHoldVolume.label")}
                                                description={t("game.options.touchHoldVolume.description")}
                                                options={getOptionChoices(choices, "touchHoldVolume")}
                                                disabled={saving}
                                                value={values.touchHoldVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="damageSeVolume"
                                                label={t("game.options.damageSeVolume.label")}
                                                description={t("game.options.damageSeVolume.description")}
                                                options={getOptionChoices(choices, "damageSeVolume")}
                                                disabled={saving}
                                                value={values.damageSeVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                        </OptionSection>
                                    </>
                                )}
                            </Stack>
                        )}

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "flex-end" }}>
                            <Button
                                variant="outlined"
                                startIcon={<RestartAltIcon />}
                                disabled={loading || saving || !isChanged}
                                onClick={handleReset}
                            >
                                {t("common.reset")}
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                loading={saving}
                                disabled={loading || saving || !isChanged}
                                onClick={() => void handleSave()}
                            >
                                {t("common.saveSettings")}
                            </Button>
                        </Stack>

                        <Snackbar
                            open={isChanged && !loading}
                            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                            message={t("game.unsaved")}
                            action={
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        startIcon={<RestartAltIcon />}
                                        color="inherit"
                                        size="small"
                                        disabled={saving}
                                        onClick={handleReset}
                                    >
                                        {t("common.reset")}
                                    </Button>
                                    <Button
                                        color="primary"
                                        size="small"
                                        variant="contained"
                                        startIcon={<CheckCircleIcon />}
                                        loading={saving}
                                        disabled={saving}
                                        onClick={() => void handleSave()}
                                    >
                                        {t("common.save")}
                                    </Button>
                                </Stack>
                            }
                        />
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

export default PageSettingsGame;
