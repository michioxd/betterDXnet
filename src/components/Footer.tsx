import { Box, Link, Tooltip, Typography } from "@mui/material";
import { version as ReactVersion } from "react";
import { useTranslation } from "react-i18next";

export default function Footer() {
    const { t } = useTranslation("layout");
    const buildDate = new Date(import.meta.env.VITE_BUILD_TIME);

    return (
        <>
            <Box sx={{ flex: "1", minWidth: 0 }}></Box>
            <Typography
                variant="body2"
                color="textSecondary"
                sx={{ p: 1, fontSize: 12, opacity: 0.5, transition: "opacity 0.2s", "&:hover": { opacity: 1 } }}
            >
                <Link color="inherit" target="_blank" href="https://github.com/michioxd/betterDXnet">
                    betterDXnet
                </Link>{" "}
                {t("footer.by")}{" "}
                <Link color="inherit" target="_blank" href="https://github.com/michioxd">
                    michioxd
                </Link>{" "}
                {t("footer.with")}{" "}
                <Link
                    color="inherit"
                    target="_blank"
                    href="https://github.com/michioxd/betterDXnet/graphs/contributors"
                >
                    {t("footer.contributors")}
                </Link>{" "}
                - {t("footer.version")}{" "}
                <Link
                    color="inherit"
                    target="_blank"
                    href={`https://github.com/michioxd/betterDXnet/releases/tag/${import.meta.env.VITE_APP_VERSION}`}
                >
                    {import.meta.env.VITE_APP_VERSION}
                </Link>
                {" ("}
                <Tooltip title={`${import.meta.env.VITE_GIT_COMMIT_FULL}`} arrow>
                    <Link
                        href={`https://github.com/michioxd/betterDXnet/commit/${import.meta.env.VITE_GIT_COMMIT_FULL}`}
                        target="_blank"
                        color="inherit"
                    >
                        {import.meta.env.VITE_GIT_CURRENT_BRANCH}.{import.meta.env.VITE_GIT_COMMIT}
                    </Link>
                </Tooltip>
                {")"}
                <br />
                {t("footer.techStack", {
                    viteVersion: import.meta.env.VITE_VITE_VERSION,
                    reactVersion: ReactVersion,
                    typescriptVersion: import.meta.env.VITE_TYPESCRIPT_VERSION,
                })}
                <br />
                {t("footer.buildDate", { time: buildDate.toLocaleTimeString(), date: buildDate.toLocaleDateString() })}
                <br />
                {t("footer.segaDisclaimer")}
            </Typography>
        </>
    );
}
