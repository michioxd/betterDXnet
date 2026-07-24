const I18nPlayer = {
    album: {
        title: "Album",
        description: "Downloaded photos from maimai DX NET.",
        reload: "Reload",
        showingPhotos: "Showing {{count}} photos",
        empty: "No album photos found.",
        openImage: "Open image",
        downloadImage: "Download image",
        viewRecord: "View record",
        location: "Location",
        takenAt: "Taken at",
        untitled: "Untitled",
    },
    dxrating: {
        title: "DX Rating",
        description: "Songs used for your DX Rating calculation.",
        reload: "Reload",
        showingItems: "Showing {{count}} charts. Current calculated rating: {{rating}}",
        sectionSummary: "{{count}} charts - {{rating}} rating",
        emptySection: "No charts found in this section.",
        achievement: "Achievement",
        rating: "Rating",
        ratingUnavailable: "Rating is only available when song details are found.",
        untitled: "Untitled",
        tabs: {
            manual: "Manual Calculation",
            dxnet: "DX NET Rating",
        },
        export: {
            generateImage: "Generate Image",
            title: "Generating image",
            assetsLoaded: "{{loaded}} / {{total}} assets loaded",
            pleaseWait: "Please wait, the image will download automatically.",
            unresponsiveNote:
                "If your browser becomes unresponsive, the export is still running in the background. Please wait until the download starts.",
            cancel: "Cancel",
            log: {
                asset: "{{loaded}}/{{total}} {{message}}",
            },
            status: {
                preparingCanvas: "Preparing canvas",
                loadingAssets: "Loading assets",
                exportingImage: "Exporting image",
                downloadStarted: "Download started",
                exportFailed: "Export failed",
            },
            error: {
                renderFailed: "Failed to render image",
            },
            firefoxNote:
                "Due to technical limitations, Firefox does not allow downloading external images unless running in standalone mode. Please open betterDXnet in a new tab and click the betterDXnet icon in the top-right corner of your browser to export the image.",
        },
        sections: {
            new: "Songs for Rating (New)",
            old: "Songs for Rating (Others)",
            selectionNew: "Songs for Rating Selection (New)",
            selectionOld: "Songs for Rating Selection (Others)",
        },
    },
};

export default I18nPlayer;
