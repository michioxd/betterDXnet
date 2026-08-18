const I18nPages = {
    home: {
        welcome: "Welcome back! {{userName}}",
        youAreUsing: "You are using betterDXnet v{{version}}",
        recentRecords: "Recent records",
        recentRecordsDescription: "Latest plays from your Last 50.",
        reload: "Reload",
        seeAll: "See all",
        quickAccess: {
            title: "Quick access",
            description: "Jump to frequently used betterDXnet pages.",
            dxRating: {
                title: "DX Rating (B50)",
                description: "Review your DX Rating charts and export a rating image (B50).",
            },
            songScores: {
                title: "Song scores",
                description: "Browse and filter all song scores you've played before.",
            },
            album: {
                title: "Album",
                description: "View and download your photos saved.",
            },
            gameSetting: {
                title: "Game setting",
                description: "Adjust game options and preferences.",
            },
        },
        quickAccessNote: "You can find more features in the navigation bar on the left side of the page.",
        summary: {
            title: "Summary",
            description: "Generate a summary from your last 50 plays.",
            generate: "Generate summary",
            reload: "Reload summary",
            progress: "Loaded {{loaded}} / {{total}} records.",
            progressFailed: " Failed {{failed}}.",
            loadError: "Failed to load {{count}} play log detail(s). Summary may be incomplete.",
            accuracyLossByNoteType: {
                title: "Accuracy Loss by Note Type",
                description: "Total achievement percentage lost across loaded play logs.",
            },
            accuracyByNoteType: {
                title: "Accuracy by Note Type",
                description: "Weighted accuracy percentage across loaded play logs.",
            },
            overallJudgmentDistribution: {
                title: "Overall Judgment Distribution",
                description: "Total judgment counts across loaded play logs.",
            },
            judgeDistribution: {
                title: "Judge Distribution",
                description: "Judgment percentages split by note type across loaded play logs.",
            },
        },
    },
    notReady: {
        title: "Not Ready",
        description: "This page is not ready yet or not found.",
    },
};

export default I18nPages;
