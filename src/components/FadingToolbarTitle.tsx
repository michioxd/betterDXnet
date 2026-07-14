import { Box, Chip, Fade, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const randomFadeDelay = () => Math.floor(Math.random() * 4001) + 4000;

function FadingToolbarTitle({
    username,
    rankType,
    version,
}: {
    username?: string;
    rankType?: string;
    version?: string;
}) {
    const [showUsername, setShowUsername] = useState(false);

    useEffect(() => {
        if (!username) {
            setShowUsername(false);
            return;
        }

        const transitionId = window.setTimeout(() => {
            setShowUsername(true);
        }, 50);
        let fadeTimerId: number;
        const scheduleFade = () => {
            fadeTimerId = window.setTimeout(() => {
                setShowUsername((value) => !value);
                scheduleFade();
            }, randomFadeDelay());
        };

        scheduleFade();

        return () => {
            window.clearTimeout(transitionId);
            window.clearTimeout(fadeTimerId);
        };
    }, [username]);

    return (
        <Box sx={{ flexGrow: 1, display: "grid", minWidth: 0 }}>
            <Fade in={Boolean(username) && showUsername} timeout={500}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ gridArea: "1 / 1", minWidth: 0 }}
                    data-ranking-color-type={rankType ?? ""}
                >
                    {username}{" "}
                    <Tooltip title={`DX Version: ${version ?? "unknown"}`} arrow>
                        <Chip label={version} size="small" sx={{ width: "fit-content", height: "fit-content" }} />
                    </Tooltip>
                </Typography>
            </Fade>
            <Fade in={!username || !showUsername} timeout={500}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ gridArea: "1 / 1", minWidth: 0 }}
                    data-ranking-color-type=""
                >
                    betterDXnet
                </Typography>
            </Fade>
        </Box>
    );
}

export default FadingToolbarTitle;
