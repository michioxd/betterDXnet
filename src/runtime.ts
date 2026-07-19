export const extensionApi = ((globalThis as typeof globalThis & { browser?: typeof chrome }).browser ??
    chrome) as typeof chrome;

export const extensionRuntime = extensionApi.runtime;
