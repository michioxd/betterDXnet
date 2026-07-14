import { apiOptions } from "@/api";
import { rootStore } from "@/stores/root";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import PersonAddDisabledIcon from "@mui/icons-material/PersonAddDisabled";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SpaceBarIcon from "@mui/icons-material/SpaceBar";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";

const playerNameSymbols = [
    "\u30FB",
    "\uFF1A",
    "\uFF1B",
    "\uFF1F",
    "\uFF01",
    "\uFF5E",
    "\uFF0F",
    "\uFF0B",
    "\uFF0D",
    "\u00D7",
    "\u00F7",
    "\uFF1D",
    "\u2642",
    "\u2640",
    "\u2200",
    "\uFF03",
    "\uFF06",
    "\uFF0A",
    "\uFF20",
    "\u2606",
    "\u25CB",
    "\u25CE",
    "\u25C7",
    "\u25A1",
    "\u25B3",
    "\u25BD",
    "\u266A",
    "\u2020",
    "\u2021",
    "\u03A3",
    "\u03B1",
    "\u03B2",
    "\u03B3",
    "\u03B8",
    "\u03C6",
    "\u03C8",
    "\u03C9",
    "\u0414",
    "\u0451",
    "\uFF04",
    "\uFF08",
    "\uFF09",
    "\uFF0E",
    "\uFF3F",
    "\u3000",
];

function PageSettingsPlayer() {
    const { app, me } = rootStore;
    const currentPlayerName = me.me?.name ?? "";
    const initializedPlayerNameRef = useRef(false);
    const [playerName, setPlayerName] = useState(currentPlayerName);
    const [friendRegistOption, setFriendRegistOption] = useState("0");
    const [loading, setLoading] = useState(false);
    const [friendRegistOptionLoading, setFriendRegistOptionLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!initializedPlayerNameRef.current && currentPlayerName) {
            setPlayerName(currentPlayerName);
            initializedPlayerNameRef.current = true;
        }
    }, [currentPlayerName]);

    useEffect(() => {
        app.setGlobalLoading(loading);
    }, [app, loading]);

    useEffect(() => {
        let disposed = false;

        const loadFriendRegistOption = async () => {
            setFriendRegistOptionLoading(true);
            setError(null);

            try {
                const currentOption = await apiOptions.profile.currentUserFriendRegistOption();

                if (disposed) return;

                setFriendRegistOption(currentOption ? "1" : "0");
            } catch (error) {
                if (disposed) return;

                setError(error as Error);
            } finally {
                if (disposed) return;

                setFriendRegistOptionLoading(false);
            }
        };

        void loadFriendRegistOption();

        return () => {
            disposed = true;
        };
    }, []);

    const trimmedPlayerName = playerName.trim();
    const isPlayerNameChanged = trimmedPlayerName !== currentPlayerName;
    const playerNameLength = useMemo(() => Array.from(playerName).length, [playerName]);

    const getRequiredUserToken = () => {
        const token = me.getUserToken();

        if (!token) {
            throw new Error("User token not found");
        }

        return token;
    };

    const appendSymbol = (symbol: string) => {
        setPlayerName((value) =>
            Array.from(value + symbol)
                .slice(0, 8)
                .join(""),
        );
    };

    const handleResetPlayerName = () => {
        setPlayerName(currentPlayerName);
    };

    const handleUpdatePlayerName = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await apiOptions.profile.updateUserName(trimmedPlayerName, getRequiredUserToken());
            await me.refresh();
            setSuccessMessage("Player name updated.");
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFriendRegistOption = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await apiOptions.profile.updateUserFriendRegistOption(friendRegistOption === "1", getRequiredUserToken());
            setSuccessMessage("Friend registration skip setting updated.");
        } catch (error) {
            setError(error as Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
                <Typography variant="h5">Settings / Player</Typography>
                <Typography color="textSecondary">Change player name and friend registration skip setting.</Typography>
            </Box>

            {error && <Alert severity="error">{error.message}</Alert>}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <PersonIcon color="primary" />
                            <Typography variant="h6">Player name</Typography>
                        </Stack>

                        <TextField
                            fullWidth
                            label="Player name"
                            value={playerName}
                            disabled={loading}
                            slotProps={{ htmlInput: { maxLength: 8 } }}
                            helperText="Up to 8 double-byte characters."
                            onChange={(event) => setPlayerName(Array.from(event.target.value).slice(0, 8).join(""))}
                        />

                        <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                The following symbols can also be used ({playerNameLength}/8):
                            </Typography>
                            <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.8 }}>
                                {playerNameSymbols.map((symbol) => (
                                    <span key={symbol}>
                                        <IconButton
                                            size="small"
                                            disabled={loading || playerNameLength >= 8}
                                            onClick={() => appendSymbol(symbol)}
                                            sx={{
                                                border: 1,
                                                borderColor: "divider",
                                                borderRadius: 1,
                                                width: 34,
                                                height: 34,
                                                fontSize: "0.95rem",
                                            }}
                                        >
                                            {symbol === "\u3000" ? <SpaceBarIcon fontWeight="medium" /> : symbol}
                                        </IconButton>
                                    </span>
                                ))}
                            </Stack>
                        </Box>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ justifyContent: "flex-end" }}>
                            <Button
                                variant="outlined"
                                startIcon={<RestartAltIcon />}
                                disabled={loading || !isPlayerNameChanged}
                                onClick={handleResetPlayerName}
                            >
                                Reset
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={
                                    loading ? <CircularProgress color="inherit" size={16} /> : <CheckCircleIcon />
                                }
                                disabled={loading || !trimmedPlayerName || playerNameLength > 8 || !isPlayerNameChanged}
                                onClick={() => void handleUpdatePlayerName()}
                            >
                                Change
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Card variant="outlined">
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <PersonAddDisabledIcon color="primary" />
                            <Typography variant="h6">Friend registration skip setting</Typography>
                        </Stack>

                        <Divider />

                        <FormControl fullWidth disabled={loading || friendRegistOptionLoading}>
                            <InputLabel id="friend-regist-option-label">Friend registration</InputLabel>
                            <Select
                                labelId="friend-regist-option-label"
                                label="Friend registration"
                                value={friendRegistOption}
                                onChange={(event) => setFriendRegistOption(event.target.value)}
                            >
                                <MenuItem value="0">Do not skip friend registration</MenuItem>
                                <MenuItem value="1">Skip friend registration</MenuItem>
                            </Select>
                        </FormControl>

                        <Typography variant="body2" color="textSecondary">
                            When selecting 'Skip', friend registration screen will skip when playing 2P with a user who
                            is not a friend.
                        </Typography>

                        <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                startIcon={
                                    loading || friendRegistOptionLoading ? (
                                        <CircularProgress color="inherit" size={16} />
                                    ) : (
                                        <CheckCircleIcon />
                                    )
                                }
                                disabled={loading || friendRegistOptionLoading}
                                onClick={() => void handleUpdateFriendRegistOption()}
                            >
                                Save setting
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}

export default observer(PageSettingsPlayer);
