import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

const toManifestVersion = (version: string) => {
    const cleanVersion = version.split(/[+-]/)[0];
    const parts = cleanVersion.split(".");

    if (parts.length < 1 || parts.length > 4 || parts.some((part) => !/^\d+$/.test(part) || Number(part) > 65536)) {
        throw new Error(`Invalid extension manifest version: ${version}`);
    }

    return parts.join(".");
};

export default defineManifest(({ mode }) => ({
    manifest_version: 3,
    name: "betterDXnet",
    description: "just an alternative UI for sinmaiDX :)",
    version: toManifestVersion(pkg.version),
    icons: {
        16: "assets/16.png",
        32: "assets/32.png",
        48: "assets/48.png",
        128: "assets/128.png",
    },
    minimum_chrome_version: "109",
    author: {
        email: "neko@michioxd.ch",
    },
    homepage_url: "https://github.com/michioxd/betterDXnet",
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
            js: ["src/content.ts"],
            matches: ["https://maimaidx-eng.com/*"],
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
