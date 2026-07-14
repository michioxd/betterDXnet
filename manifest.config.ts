import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
    manifest_version: 3,
    name: "betterDXnet",
    description: "just an alternative UI for sinmaiDX :)",
    version: pkg.version,
    icons: {
        16: "assets/16.png",
        32: "assets/32.png",
        48: "assets/48.png",
        128: "assets/128.png",
    },
    permissions: ["contentSettings"],
    content_scripts: [
        {
            js: ["src/main.tsx"],
            matches: ["https://maimaidx-eng.com/maimai-mobile/*"],
            run_at: "document_idle",
        },
    ],
});
