import { Box, Link, Tooltip, Typography } from "@mui/material";
import { version as ReactVersion } from "react";
import { Trans, useTranslation } from "react-i18next";

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
                <Trans
                    ns="layout"
                    i18nKey="footer.source"
                    values={{
                        appVersion: import.meta.env.VITE_APP_VERSION,
                        branch: import.meta.env.VITE_GIT_CURRENT_BRANCH,
                        commit: import.meta.env.VITE_GIT_COMMIT,
                    }}
                    components={[
                        <Link color="inherit" target="_blank" href="https://github.com/michioxd/betterDXnet" />,
                        <Link color="inherit" target="_blank" href="https://github.com/michioxd" />,
                        <Link
                            color="inherit"
                            target="_blank"
                            href="https://github.com/michioxd/betterDXnet/graphs/contributors"
                        />,
                        <Link
                            color="inherit"
                            target="_blank"
                            href={`https://github.com/michioxd/betterDXnet/releases/tag/${import.meta.env.VITE_APP_VERSION}`}
                        />,
                        <Tooltip title={`${import.meta.env.VITE_GIT_COMMIT_FULL}`} arrow>
                            <Link
                                href={`https://github.com/michioxd/betterDXnet/commit/${import.meta.env.VITE_GIT_COMMIT_FULL}`}
                                target="_blank"
                                color="inherit"
                            />
                        </Tooltip>,
                    ]}
                />
                <br />
                <Trans
                    ns="layout"
                    i18nKey="footer.techStack"
                    values={{
                        viteVersion: import.meta.env.VITE_VITE_VERSION,
                        reactVersion: ReactVersion,
                        typescriptVersion: import.meta.env.VITE_TYPESCRIPT_VERSION,
                    }}
                />
                <br />
                <Trans
                    ns="layout"
                    i18nKey="footer.buildDate"
                    values={{ time: buildDate.toLocaleTimeString(), date: buildDate.toLocaleDateString() }}
                />
                <br />
                {t("footer.segaDisclaimer")}
            </Typography>
        </>
    );
}
