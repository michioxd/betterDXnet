import { extensionApi, extensionRuntime } from "./runtime";

const MATCH_URL = "https://maimaidx-eng.com";

extensionApi.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;

    if (!tab.url?.startsWith(MATCH_URL)) {
        await extensionApi.tabs.create({
            url: extensionApi.runtime.getURL("app.html"),
        });

        return;
    }

    try {
        await extensionApi.tabs.sendMessage(tab.id, {
            type: "betterdxnet:toggle",
        });
    } catch {}
});

extensionRuntime.onMessage.addListener((message) => {
    if (message.type === "betterdxnet.openInNewTab") {
        extensionApi.tabs.create({
            url: extensionApi.runtime.getURL("app.html"),
        });
    }
});
