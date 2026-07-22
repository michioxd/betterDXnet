const patchRechartsFirefox = () => ({
    name: "fix-recharts-firefox-animation-frame",
    transform(code: string, id: string) {
        const normalizedId = id.replaceAll("\\", "/");
        if (!normalizedId.includes("/node_modules/recharts/es6/")) return null;

        let patchedCode = code;

        if (normalizedId.endsWith("/node_modules/recharts/es6/state/store.js")) {
            patchedCode = patchedCode.replace("getDefaultEnhancers()", "getDefaultEnhancers({ autoBatch: false })");
            patchedCode = patchedCode.replace("type: 'raf'", "type: 'tick'");
        }

        if (normalizedId.endsWith("/node_modules/recharts/es6/state/eventSettingsSlice.js")) {
            patchedCode = patchedCode.replace("throttleDelay: 'raf'", "throttleDelay: 16");
        }

        patchedCode = patchedCode
            .replaceAll("requestAnimationFrame(", "window.requestAnimationFrame.call(window, ")
            .replaceAll("cancelAnimationFrame(", "window.cancelAnimationFrame.call(window, ");

        return patchedCode === code ? null : patchedCode;
    },
});

export default patchRechartsFirefox;
