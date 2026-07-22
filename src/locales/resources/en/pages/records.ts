const I18nRecords = {
    last50: {
        title: "Last 50",
        description: "Recent play records.",
        reload: "Reload",
        showingRecords: "Showing {{count}} records",
    },
    card: {
        untitled: "Untitled",
        new: "NEW",
        achievement: "Achievement",
        dxScore: "DX Score",
        trackNo: "No. {{trackNo}}",
        perfectChallenge: "Perfect Challenge",
        life: "LIFE {{current}} / {{max}}",
    },
    detail: {
        title: "Play Log Detail",
        description: "Detailed result for this play record.",
        back: "Back to Last 50",
        reload: "Reload",
        recordIdNotFound: "Record id not found.",
        actions: {
            showLostPercentage: "Show lost percentage",
            hideLostPercentage: "Hide lost percentage",
        },
        judgeDistribution: {
            title: "Judge Distribution",
            description: "Judgment counts split by note type.",
        },
        accuracyByNoteType: {
            title: "Accuracy by Note Type",
            description: "Accuracy percentage across each notes.",
        },
        overallJudgmentDistribution: {
            title: "Overall Judgment Distribution",
            description: "Total judgment counts across all note types.",
        },
        accuracyLossByNoteType: {
            title: "Accuracy Loss by Note Type",
            description: "Achievement percentage lost for each note type.",
        },
        chartDetails: {
            title: "Chart details",
            description: "Metadata from the maimai song database for this chart.",
            noteCounts: "Note counts",
            actions: {
                findOnYouTube: "Find on YouTube",
            },
            chips: {
                new: "New",
                special: "Special",
            },
            fields: {
                artist: "Artist",
                bpm: "BPM",
                version: "Version",
                category: "Category",
                songId: "Song ID",
                releaseDate: "Release date",
                chartDesigner: "Chart designer",
                internalLevelValue: "Internal level value",
            },
            noteTypes: {
                total: "Total",
            },
        },
        timingBias: {
            title: "Timing Bias",
            summary: "Late {{late}} - Fast {{fast}} - Bias {{bias}}",
            even: "Even",
            adjustmentSuggestion: "Timing Adjustment Suggestion",
            timingABRange: "Timing A/B {{range}}",
            disclaimer: "Suggestion based on Fast/Late statistics only.",
            suggestions: {
                balanced: "Timing looks balanced. No adjustment recommended.",
                fast: {
                    slight: "You tend to hit slightly Fast. Try reducing Timing A/B by 0.5.",
                    moderate: "You consistently hit Fast. Try reducing Timing A/B by 0.5–1.0.",
                    strong: "You heavily hit Fast. Try reducing Timing A/B by 1.0–2.0.",
                },
                late: {
                    slight: "You tend to hit slightly Late. Try increasing Timing A/B by 0.5.",
                    moderate: "You consistently hit Late. Try increasing Timing A/B by 0.5–1.0.",
                    strong: "You heavily hit Late. Try increasing Timing A/B by 1.0–2.0.",
                },
            },
        },
        labels: {
            note: "Note",
            noteType: "Note Type",
            fast: "Fast",
            late: "Late",
            bias: "Bias",
            accuracyPercent: "Accuracy %",
            accuracyLoss: "Accuracy Loss",
            totalLossShare: "Total Loss Share",
            total: "Total",
        },
        chips: {
            fast: "FAST {{count}}",
            late: "LATE {{count}}",
            rating: "Rating {{rating}} ({{delta}})",
            maxCombo: "Max Combo {{current}} / {{max}}",
            maxSync: "Max Sync {{current}} / {{max}}",
            totalNotes: "Total Notes {{count}}",
            accuracyLoss: "Accuracy Loss {{value}}",
        },
        judgments: {
            criticalPerfect: "Critical Perfect",
            perfect: "Perfect",
            great: "Great",
            good: "Good",
            miss: "Miss",
        },
    },
};

export default I18nRecords;
