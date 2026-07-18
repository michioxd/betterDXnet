const TOGGLE_MESSAGE_TYPE = "betterdxnet:toggle";
const extensionApi = ((globalThis as typeof globalThis & { browser?: typeof chrome }).browser ??
    chrome) as typeof chrome;

extensionApi.action.onClicked.addListener((tab) => {
    if (!tab.id) {
        return;
    }

    const result = extensionApi.tabs.sendMessage(tab.id, { type: TOGGLE_MESSAGE_TYPE }, () => {
        extensionApi.runtime.lastError;
    }) as Promise<void> | void;

    result?.catch(() => undefined);
});
