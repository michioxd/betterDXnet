import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
    manifest_version: 3,
    name: "betterDXnet",
    description: "just an alternative UI for sinmaiDX :)",
    version: pkg.version,
    icons: {
        48: "public/logo.png",
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
