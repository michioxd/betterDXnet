import { Link, Tooltip, Typography } from "@mui/material";
import { version as ReactVersion } from "react";

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
                by{" "}
                <Link color="inherit" target="_blank" href="https://github.com/michioxd">
                    michioxd
                </Link>{" "}
                with{" "}
                <Link
                    color="inherit"
                    target="_blank"
                    href="https://github.com/michioxd/betterDXnet/graphs/contributors"
                >
                    contributors
                </Link>{" "}
                - version{" "}
                <Link
                    color="inherit"
                    target="_blank"
                    href={`https://github.com/michioxd/betterDXnet/releases/tag/${import.meta.env.VITE_APP_VERSION}`}
                >
                    {import.meta.env.VITE_APP_VERSION}
                </Link>{" "}
                -{" "}
                <Tooltip title={`${import.meta.env.VITE_GIT_COMMIT_FULL}`} arrow>
                    <Link
                        href={`https://github.com/michioxd/betterDXnet/commit/${import.meta.env.VITE_GIT_COMMIT_FULL}`}
                        target="_blank"
                        color="inherit"
                    >
                        {import.meta.env.VITE_GIT_CURRENT_BRANCH}.{import.meta.env.VITE_GIT_COMMIT}
                    </Link>
                </Tooltip>
                <br />
                {import.meta.env.VITE_VITE_VERSION} - React {ReactVersion} - TypeScript{" "}
                {import.meta.env.VITE_TYPESCRIPT_VERSION}
                <br />
                Build date: {new Date(import.meta.env.VITE_BUILD_TIME).toLocaleTimeString()}{" "}
                {new Date(import.meta.env.VITE_BUILD_TIME).toLocaleDateString()}
            </Typography>
        </>
    );
}
