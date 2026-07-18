const I18nLayout = {
    loading: {
        errorTitle: "An error occurred!",
        close: "Close",
        fetchingData: "Please wait while we are fetching your data...",
    },
    toolbar: {
        openSidebar: "Open sidebar",
        closeSidebar: "Close sidebar",
        refreshProfile: "Refresh profile. Hold to fully reload.",
        refresh: "Refresh",
        unload: "Unload betterDXnet",
        close: "Close",
        dxVersion: "DX Version: {{version}}",
        unknownVersion: "unknown",
    },
    language: {
        fallbackName: "English",
    },
    profileCard: {
        iconAlt: "icon",
        badgeAlt: "badge",
        starAlt: "star",
    },
    footer: {
        by: "by",
        with: "with",
        contributors: "contributors",
        version: "version",
        techStack: "{{viteVersion}} - React {{reactVersion}} - TypeScript {{typescriptVersion}}",
        buildDate: "Build date: {{time}} {{date}}",
        segaDisclaimer:
            "SEGA and maimai are registered trademarks of SEGA Interactive Co., Ltd. This is an unofficial extension and is not affiliated with, endorsed, sponsored, or approved by SEGA Interactive Co., Ltd.",
    },
    disclaimer: {
        title: "Disclaimer",
        openSourcePrefix: "betterDXnet is an",
        openSourceLink: "open source",
        openSourceSuffix:
            "and unofficial browser extension to give you an alternative and better Web UI experience. And of course it is not affiliated with, endorsed by, sponsored by, or approved by SEGA.",
        asIsPrefix: "This extension is provided",
        asIs: '"as is"',
        asIsSuffix:
            ", without any warranty of any kind. By installing or continuing to use betterDXnet, you acknowledge that you do so entirely at your own risk and accept full responsibility for any issues, unexpected behavior, data loss, account-related consequences, or other damages that may arise from its use.",
        riskPrefix:
            "If you are unsure whether using this extension complies with SEGA's policies, or if you are not comfortable accepting the risks described above,",
        riskWarning: "do not use this extension and remove it from your browser immediately.",
        acknowledge:
            'By clicking "I understand", you acknowledge that you have read and understood this disclaimer, and you accept the risks associated with using betterDXnet.',
        acceptOnce: "You only have to accept this disclaimer once.",
        cancel: "Cancel",
        understand: "I understand",
        understandCountdown: "I understand ({{seconds}}s)",
    },
};

export default I18nLayout;
