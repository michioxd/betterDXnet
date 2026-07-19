import { extensionApi } from "./runtime";

const TOGGLE_MESSAGE_TYPE = "betterdxnet:toggle";

extensionApi.action.onClicked.addListener((tab) => {
    if (!tab.id) {
        return;
    }

    const result = extensionApi.tabs.sendMessage(tab.id, { type: TOGGLE_MESSAGE_TYPE }, () => {
        extensionApi.runtime.lastError;
    }) as Promise<void> | void;

    result?.catch(() => undefined);
});
