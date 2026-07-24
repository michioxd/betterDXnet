const I18nLayout = {
    loading: {
        errorTitle: "An error occurred!",
        close: "Close",
        fetchingData: "Please wait while we are fetching your data...",
        errorNetwork: "Unable to connect! You may need to log in again.",
        goToLogin: "Go to Login",
    },
    toolbar: {
        openSidebar: "Open sidebar",
        closeSidebar: "Close sidebar",
        refreshProfile: "Refresh profile. Hold to fully reload.",
        refresh: "Refresh",
        themeModeLabel: "Theme: {{mode}}. Click to change.",
        themeMode: {
            light: "Light",
            dark: "Dark",
            system: "Auto",
        },
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
        source: "<0>betterDXnet</0> by <1>michioxd</1> with <2>contributors</2> - version <3>{{appVersion}}</3> (<4>{{branch}}.{{commit}}</4>)",
        techStack: "{{viteVersion}} - React {{reactVersion}} - TypeScript {{typescriptVersion}}",
        buildDate: "Build date: {{time}} {{date}}",
        segaDisclaimer:
            "SEGA and maimai are registered trademarks of SEGA Interactive Co., Ltd. This is an unofficial extension and is not affiliated with, endorsed, sponsored, or approved by SEGA Interactive Co., Ltd.",
    },
    disclaimer: {
        title: "Disclaimer",
        openSource:
            "betterDXnet is an <0>open source</0> and unofficial browser extension to give you an alternative and better Web UI experience. And of course it is not affiliated with, endorsed by, sponsored by, or approved by SEGA.",
        asIsText:
            'This extension is provided <0>"as is"</0>, without any warranty of any kind. By installing or continuing to use betterDXnet, you acknowledge that you do so entirely at your own risk and accept full responsibility for any issues, unexpected behavior, data loss, account-related consequences, or other damages that may arise from its use.',
        risk: "If you are unsure whether using this extension complies with SEGA's policies, or if you are not comfortable accepting the risks described above, <0>do not use this extension and remove it from your browser immediately.</0>",
        acknowledge:
            'By clicking "I understand", you acknowledge that you have read and understood this disclaimer, and you accept the risks associated with using betterDXnet.',
        acceptOnce: "You only have to accept this disclaimer once.",
        cancel: "Cancel",
        understand: "I understand",
        understandCountdown: "I understand ({{seconds}}s)",
    },
};

export default I18nLayout;
