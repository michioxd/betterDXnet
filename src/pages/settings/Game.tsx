import {
    currentGameOptions,
    updateGameOptions,
    type GameOptionName,
    type GameOptionSelectOption,
    type GameOptionValues,
} from "@/api/options";
import { rootStore } from "@/stores/root";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import {
    Alert,
    Box,
    Button,
    CardActionArea,
    Card,
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

type OptionImagePickerProps = {
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
    title: string;
    recommendation: string;
    summary: string;
    tone: "success" | "warning" | "error" | "secondary";
};

type GameOptionChoices = Partial<Record<GameOptionName, GameOptionSelectOption[]>>;

const optionKindPresets: Record<string, OptionKindPreset> = {
    "0": {
        title: "BASIC",
        recommendation: "Recommended for comfortable casual play.",
        summary: "Balanced defaults",
        tone: "success",
    },
    "1": {
        title: "ADVANCED",
        recommendation: "For players who want more readable notes.",
        summary: "Faster preset",
        tone: "warning",
    },
    "2": {
        title: "EXPERT",
        recommendation: "For experienced players who prefer speed.",
        summary: "High-speed preset",
        tone: "error",
    },
    "3": {
        title: "DETAILS / CUSTOM",
        recommendation: "Unlock every option and tune settings manually.",
        summary: "Full custom control",
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

function OptionImagePicker({ name, label, description, options, disabled, value, onChange }: OptionImagePickerProps) {
    return (
        <Box sx={{ gridColumn: "1 / -1", minWidth: 0 }}>
            <Stack spacing={1}>
                <Box>
                    <Typography variant="subtitle2">{label}</Typography>
                    {description && (
                        <Typography variant="body2" color="textSecondary">
                            {description}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, maxWidth: "100%", minWidth: 0, overflowX: "auto", pb: 1 }}>
                    {options.map((selectOption) => {
                        const optionIndex = Number(selectOption.value);
                        const selected = selectOption.value === value;
                        const optionLabel = dispJudgeLabels[optionIndex] ?? selectOption.label;

                        return (
                            <Card
                                key={selectOption.value}
                                variant="outlined"
                                sx={{
                                    borderColor: selected ? "primary.main" : "divider",
                                    borderWidth: selected ? 2 : 1,
                                    flex: "0 0 232px",
                                }}
                            >
                                <CardActionArea
                                    disabled={disabled}
                                    onClick={() => onChange(name, selectOption.value)}
                                    sx={{ height: "100%" }}
                                >
                                    <Box
                                        component="img"
                                        src={`https://maimaidx-eng.com/maimai-mobile/img/option/disp_judge_${selectOption.value}.png`}
                                        alt={optionLabel}
                                        draggable={false}
                                        loading="lazy"
                                        sx={{ display: "block", width: "100%" }}
                                    />
                                    <Box sx={{ bgcolor: selected ? "primary.main" : "action.hover", px: 1, py: 0.75 }}>
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
            </Stack>
        </Box>
    );
}

function OptionKindCardSelector({ name, options, disabled, value, onChange }: OptionKindCardSelectorProps) {
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
                                                {preset.title}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2" color="textSecondary">
                                            {preset.recommendation}
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
                throw new Error("Game option token not found");
            }

            await updateGameOptions(values, token);
            setInitialValues(values);
            setSuccessMessage("Game options updated.");
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
                <Typography variant="h5">Settings / Game options</Typography>
                <Typography color="textSecondary">Change speed, display, design, sound, and play options.</Typography>
            </Box>

            {error && <Alert severity="error">{error.message}</Alert>}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <SettingsApplicationsIcon color="primary" />
                            <Typography variant="h6">Game options</Typography>
                            {(loading || saving) && <CircularProgress size={18} />}
                        </Stack>

                        <Divider />

                        {loading ? (
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                <CircularProgress size={20} />
                                <Typography color="textSecondary">Loading game options...</Typography>
                            </Stack>
                        ) : (
                            <Stack spacing={1.5}>
                                <OptionSection title="Presets">
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
                                        <OptionSection title="Speed">
                                            <OptionSlider
                                                name="noteSpeed"
                                                label="TAP SPEED"
                                                description="Setting of the TAP-Ring speed"
                                                options={getOptionChoices(choices, "noteSpeed")}
                                                disabled={saving}
                                                value={values.noteSpeed ?? "23"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="touchSpeed"
                                                label="TOUCH SPEED"
                                                description="Setting of the TOUCH speed"
                                                options={getOptionChoices(choices, "touchSpeed")}
                                                disabled={saving}
                                                value={values.touchSpeed ?? "22"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="slideSpeed"
                                                label="SLIDE TIMING"
                                                description="Setting of the SLIDE display timing"
                                                options={getOptionChoices(choices, "slideSpeed")}
                                                disabled={saving}
                                                value={values.slideSpeed ?? "16"}
                                                onChange={handleChange}
                                            />
                                        </OptionSection>

                                        <OptionSection title="Game">
                                            <OptionSelect
                                                name="trackSkip"
                                                label="TRACK SKIP"
                                                description="Interrupt the song and move on to the result"
                                                options={getOptionChoices(choices, "trackSkip")}
                                                disabled={saving}
                                                value={values.trackSkip ?? "1"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="mirrorMode"
                                                label="MIRROR MODE"
                                                description="Reverse left and right and/or up and down"
                                                options={getOptionChoices(choices, "mirrorMode")}
                                                disabled={saving}
                                                value={values.mirrorMode ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="starRotate"
                                                label="SLIDE ROTATION"
                                                description="Rotation setting : ★"
                                                options={getOptionChoices(choices, "starRotate")}
                                                disabled={saving}
                                                value={values.starRotate ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="adjustTiming"
                                                label="JUDGMENT TIMING A"
                                                description="For who judge the timing by listening Adjust the timing of ring-and-line overlap"
                                                options={getOptionChoices(choices, "adjustTiming")}
                                                disabled={saving}
                                                value={values.adjustTiming ?? "22"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="judgeTiming"
                                                label="JUDGMENT TIMING B"
                                                description="For who judge the timing by notes Adjust the timing of judgment"
                                                options={getOptionChoices(choices, "judgeTiming")}
                                                disabled={saving}
                                                value={values.judgeTiming ?? "33"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="brightness"
                                                label="MOVIE BRIGHTNESS"
                                                description="Adjust brightness of background movie during the game"
                                                options={getOptionChoices(choices, "brightness")}
                                                disabled={saving}
                                                value={values.brightness ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="touchEffect"
                                                label="REACTION EFFECT"
                                                description="Switch the reaction effect displayed when you touch the screen"
                                                options={getOptionChoices(choices, "touchEffect")}
                                                disabled={saving}
                                                value={values.touchEffect ?? "2"}
                                                onChange={handleChange}
                                            />
                                        </OptionSection>

                                        <OptionSection title="Display">
                                            <OptionSelect
                                                name="dispCenter"
                                                label="DISPLAY AT CENTER"
                                                description="Switch the information display at the center during the game"
                                                options={getOptionChoices(choices, "dispCenter")}
                                                disabled={saving}
                                                value={values.dispCenter ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="outFrameType"
                                                label="DISPLAY OUTSIDE THE BOX"
                                                description="Switch the information display at the top of the screen"
                                                options={getOptionChoices(choices, "outFrameType")}
                                                disabled={saving}
                                                value={values.outFrameType ?? "3"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="dispJudgePos"
                                                label="POSITION OF JUDGMENT TAP"
                                                description="Set the position of Judgment(e.g.PERFECT) displayed when hitting the TAP ring"
                                                options={getOptionChoices(choices, "dispJudgePos")}
                                                disabled={saving}
                                                value={values.dispJudgePos ?? "5"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="dispJudgeTouchPos"
                                                label="POSITION OF JUDGMENT TOUCH"
                                                description="Set the position of Judgment(e.g.PERFECT) displayed when hitting the TOUCH"
                                                options={getOptionChoices(choices, "dispJudgeTouchPos")}
                                                disabled={saving}
                                                value={values.dispJudgeTouchPos ?? "1"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="dispChain"
                                                label="SYNC/VS"
                                                description="Displayed when you play with other players"
                                                options={getOptionChoices(choices, "dispChain")}
                                                disabled={saving}
                                                value={values.dispChain ?? "1"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="submonitorAchieve"
                                                label="ACHIEVEMENT TYPE(UPPER MONITOR)"
                                                description="Switch the achievement type displayed on the upper monitor"
                                                options={getOptionChoices(choices, "submonitorAchieve")}
                                                disabled={saving}
                                                value={values.submonitorAchieve ?? "1"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="dispRate"
                                                label="RATING・GRADE・CLASS"
                                                description="Switch the RATING/GRADE/CLASS type"
                                                options={getOptionChoices(choices, "dispRate")}
                                                disabled={saving}
                                                value={values.dispRate ?? "7"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="submonitorAppeal"
                                                label="MESSAGE"
                                                description="Comment is displayed on the upper monitor"
                                                options={getOptionChoices(choices, "submonitorAppeal")}
                                                disabled={saving}
                                                value={values.submonitorAppeal ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionImagePicker
                                                name="dispJudge"
                                                label="DISPLAY OF JUDGMENT"
                                                description="Switch the judgment type"
                                                options={getOptionChoices(choices, "dispJudge")}
                                                disabled={saving}
                                                value={values.dispJudge ?? "11"}
                                                onChange={handleChange}
                                            />
                                        </OptionSection>

                                        <OptionSection title="Design">
                                            <OptionSelect
                                                name="tapDesign"
                                                label="TAP DESIGN"
                                                description="Switch the TAP design"
                                                options={getOptionChoices(choices, "tapDesign")}
                                                disabled={saving}
                                                value={values.tapDesign ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="holdDesign"
                                                label="HOLD DESIGN"
                                                description="Switch the HOLD design"
                                                options={getOptionChoices(choices, "holdDesign")}
                                                disabled={saving}
                                                value={values.holdDesign ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="slideDesign"
                                                label="SLIDE DESIGN"
                                                description="Switch the SLIDE design"
                                                options={getOptionChoices(choices, "slideDesign")}
                                                disabled={saving}
                                                value={values.slideDesign ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="starType"
                                                label="SLIDE COLOR"
                                                description="Switch ☆ color"
                                                options={getOptionChoices(choices, "starType")}
                                                disabled={saving}
                                                value={values.starType ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="outlineDesign"
                                                label="LINE DESIGN"
                                                description="Switch the LINE design"
                                                options={getOptionChoices(choices, "outlineDesign")}
                                                disabled={saving}
                                                value={values.outlineDesign ?? "3"}
                                                onChange={handleChange}
                                            />
                                        </OptionSection>

                                        <OptionSection title="Sound">
                                            <OptionSlider
                                                name="ansVolume"
                                                label="GUIDE SOUND VOLUME"
                                                description="Set the volume of guide sound for the right timing"
                                                options={getOptionChoices(choices, "ansVolume")}
                                                disabled={saving}
                                                value={values.ansVolume ?? "3"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="tapSe"
                                                label="TAP/HOLD SE (TYPE)"
                                                description="Switch the sound effect for a successful TAP"
                                                options={getOptionChoices(choices, "tapSe")}
                                                disabled={saving}
                                                value={values.tapSe ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="criticalSe"
                                                label="TAP/HOLD SE (JUDGEMENT)"
                                                description="Set the range of judgements that make the sound effect"
                                                options={getOptionChoices(choices, "criticalSe")}
                                                disabled={saving}
                                                value={values.criticalSe ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="tapHoldVolume"
                                                label="TAP/HOLD VOLUME"
                                                description="Set the TAP/HOLD sound volume"
                                                options={getOptionChoices(choices, "tapHoldVolume")}
                                                disabled={saving}
                                                value={values.tapHoldVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="breakSe"
                                                label="BREAK SE"
                                                description="Switch the sound effect for BREAK"
                                                options={getOptionChoices(choices, "breakSe")}
                                                disabled={saving}
                                                value={values.breakSe ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="breakVolume"
                                                label="BREAK VOLUME"
                                                description="Set the BREAK sound volume"
                                                options={getOptionChoices(choices, "breakVolume")}
                                                disabled={saving}
                                                value={values.breakVolume ?? "4"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="exSe"
                                                label="EX SE"
                                                description="Switch the sound effect for EX"
                                                options={getOptionChoices(choices, "exSe")}
                                                disabled={saving}
                                                value={values.exSe ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="exVolume"
                                                label="EX VOLUME"
                                                description="Set the EX sound volume"
                                                options={getOptionChoices(choices, "exVolume")}
                                                disabled={saving}
                                                value={values.exVolume ?? "3"}
                                                onChange={handleChange}
                                            />
                                            <OptionSelect
                                                name="slideSe"
                                                label="SLIDE SE"
                                                description="Switch the sound effect for SLIDE"
                                                options={getOptionChoices(choices, "slideSe")}
                                                disabled={saving}
                                                value={values.slideSe ?? "0"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="slideVolume"
                                                label="SLIDE VOLUME"
                                                description="Set the SLIDE sound volume"
                                                options={getOptionChoices(choices, "slideVolume")}
                                                disabled={saving}
                                                value={values.slideVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="breakSlideVolume"
                                                label="BREAK SLIDE VOLUME"
                                                description="Set the BREAK SLIDE sound volume"
                                                options={getOptionChoices(choices, "breakSlideVolume")}
                                                disabled={saving}
                                                value={values.breakSlideVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="touchVolume"
                                                label="TOUCH VOLUME"
                                                description="Set the TOUCH/TOUCH HOLD sound volume"
                                                options={getOptionChoices(choices, "touchVolume")}
                                                disabled={saving}
                                                value={values.touchVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="touchHoldVolume"
                                                label="TOUCH EFFECT VOLUME"
                                                description="Set the TOUCH EFFECT sound volume"
                                                options={getOptionChoices(choices, "touchHoldVolume")}
                                                disabled={saving}
                                                value={values.touchHoldVolume ?? "2"}
                                                onChange={handleChange}
                                            />
                                            <OptionSlider
                                                name="damageSeVolume"
                                                label="DAMAGE VOLUME"
                                                description="Set the DAMAGE sound volume in PERFECT CHALLENGE"
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
                                Reset
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<CheckCircleIcon />}
                                loading={saving}
                                disabled={loading || saving || !isChanged}
                                onClick={() => void handleSave()}
                            >
                                Save settings
                            </Button>
                        </Stack>

                        <Snackbar
                            open={isChanged && !loading}
                            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                            message="You have unsaved game option changes."
                            action={
                                <Stack direction="row" spacing={1}>
                                    <Button
                                        startIcon={<RestartAltIcon />}
                                        color="inherit"
                                        size="small"
                                        disabled={saving}
                                        onClick={handleReset}
                                    >
                                        Reset
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
                                        Save
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
