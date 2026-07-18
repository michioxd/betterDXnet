import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest(({ mode }) => ({
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
    action: {
        default_title: "Toggle betterDXnet",
    },
    background:
        mode === "firefox"
            ? {
                  scripts: ["src/background.ts"],
                  type: "module",
              }
            : {
                  service_worker: "src/background.ts",
                  type: "module",
              },
    content_scripts: [
        {
            js: ["src/main.tsx"],
            matches: ["https://maimaidx-eng.com/maimai-mobile/*"],
            run_at: "document_idle",
        },
    ],
    ...(mode === "firefox" && {
        browser_specific_settings: {
            gecko: {
                id: "betterdxnet@michioxd.ch",
            },
        },
    }),
}));
