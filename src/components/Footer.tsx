import { Link, Tooltip, Typography } from "@mui/material";

export default function Footer() {
    return (
        <>
            <Typography
                variant="body2"
                color="textSecondary"
                sx={{ p: 1, fontSize: 12, opacity: 0.5, transition: "opacity 0.2s", "&:hover": { opacity: 1 } }}
                align="center"
            >
                <Link color="inherit" target="_blank" href="https://github.com/michioxd/betterDXnet">
                    betterDXnet
                </Link>{" "}
                v
                <Link
                    color="inherit"
                    target="_blank"
                    href={`https://github.com/michioxd/betterDXnet/releases/tag/${import.meta.env.VITE_VERSION}`}
                >
                    {import.meta.env.VITE_VERSION}
                </Link>{" "}
                -{" "}
                <Tooltip
                    title={`Build date: ${new Date(import.meta.env.VITE_BUILD_TIME).toLocaleTimeString()} ${new Date(import.meta.env.VITE_BUILD_TIME).toLocaleDateString()} - Full Git commit hash: ${import.meta.env.VITE_GIT_COMMIT_FULL}`}
                    placement="top"
                    arrow
                >
                    <Link
                        href={`https://github.com/michioxd/betterDXnet/commit/${import.meta.env.VITE_GIT_COMMIT_FULL}`}
                        target="_blank"
                        color="inherit"
                    >
                        {import.meta.env.VITE_GIT_CURRENT_BRANCH}.{import.meta.env.VITE_GIT_COMMIT}
                    </Link>
                </Tooltip>{" "}
                - by{" "}
                <Link color="inherit" target="_blank" href="https://github.com/michioxd">
                    michioxd
                </Link>{" "}
                and thanks to{" "}
                <Link
                    color="inherit"
                    target="_blank"
                    href="https://github.com/michioxd/betterDXnet/graphs/contributors"
                >
                    contributors
                </Link>
                .
            </Typography>
        </>
    );
}
