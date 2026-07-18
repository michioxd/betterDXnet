import path from "node:path";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import zip from "vite-plugin-zip-pack";
import manifest from "./manifest.config.js";
import { version } from "./package.json";
import { execSync } from "child_process";
import postCssRemoveComments from "postcss-discard-comments";
import replaceManifestCss from "./scripts/replaceManifestCss";

const buildTime = Date.now();
const buildDate = new Date(buildTime).toISOString();
const gitCommit = execSync("git rev-parse --short HEAD").toString().trim();
const gitCommitFull = execSync("git rev-parse HEAD").toString().trim();
const gitCurrentBranch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
const viteVersion = execSync("vite --version").toString().trim();
const typescriptVersion = execSync("tsc --version").toString().trim();

export default defineConfig(({ mode }) => ({
    resolve: {
        alias: {
            "@": `${path.resolve(__dirname, "src")}`,
        },
    },
    define: {
        "import.meta.env.VITE_BUILD_TIME": JSON.stringify(buildTime),
        "import.meta.env.VITE_BUILD_DATE": JSON.stringify(buildDate),
        "import.meta.env.VITE_GIT_COMMIT": JSON.stringify(gitCommit),
        "import.meta.env.VITE_GIT_COMMIT_FULL": JSON.stringify(gitCommitFull),
        "import.meta.env.VITE_GIT_CURRENT_BRANCH": JSON.stringify(gitCurrentBranch),
        "import.meta.env.VITE_APP_VERSION": JSON.stringify(version),
        "import.meta.env.VITE_VITE_VERSION": JSON.stringify(viteVersion),
        "import.meta.env.VITE_TYPESCRIPT_VERSION": JSON.stringify(typescriptVersion).replaceAll("Version ", ""),
        "import.meta.resolve": "undefined",
        "import.meta.url": "location.href",
    },
    plugins: [
        react(),
        crx({ manifest }),
        replaceManifestCss(),
        zip({
            outDir: "release",
            outFileName: `betterDXnet-${mode === "firefox" ? "firefox" : "chrome"}-${version}.zip`,
        }),
    ],
    server: {
        host: "127.0.0.1",
        port: 5173,
        strictPort: true,

        cors: {
            origin: [/^chrome-extension:\/\//],
        },

        hmr: {
            host: "127.0.0.1",
            port: 5173,
            clientPort: 5173,
            protocol: "ws",
        },
    },
    css:
        process.env.NODE_ENV === "production"
            ? {
                  modules: {
                      generateScopedName: (() => {
                          let counter = 0;
                          const nameMap = new Map<string, string>();

                          return (localName: string, filename: string) => {
                              const key = `${filename}|${localName}`;

                              if (!nameMap.has(key)) {
                                  let name = "";
                                  let index = counter++;

                                  do {
                                      name = String.fromCharCode(97 + (index % 26)) + name;
                                      index = Math.floor(index / 26) - 1;
                                  } while (index >= 0);

                                  const randomSuffix = Math.floor(Math.random() * 100)
                                      .toString()
                                      .padStart(2, "0");
                                  nameMap.set(key, `${name}${randomSuffix}`);
                              }

                              return nameMap.get(key)!;
                          };
                      })(),
                  },
                  postcss: {
                      plugins: [
                          postCssRemoveComments({
                              removeAll: true,
                          }),
                      ],
                  },
              }
            : {},
    build: {
        minify: "terser",
        sourcemap: "hidden",
        cssCodeSplit: false,
        modulePreload: false,
        terserOptions: {
            parse: {
                html5_comments: false,
            },
            format: {
                comments: false,
            },
        },
    },
}));
