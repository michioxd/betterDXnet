import { promises as fs } from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";

type ReplaceManifestCssOptions = {
    manifestFileName?: string;
    cssFilePattern?: RegExp;
};

export default function replaceManifestCss({
    manifestFileName = "manifest.json",
    cssFilePattern = /^assets\/style-[\w-]+\.css$/,
}: ReplaceManifestCssOptions = {}): Plugin {
    let config: ResolvedConfig;

    return {
        name: "betterdxnet:replace-manifest-css",
        apply: "build",
        enforce: "post",
        configResolved(resolvedConfig) {
            config = resolvedConfig;
        },
        async closeBundle() {
            const outDir = path.resolve(config.root, config.build.outDir);
            const cssFileName = await findCssFileName(outDir, cssFilePattern);

            if (!cssFileName) {
                this.error(`Could not find built CSS file matching ${cssFilePattern}.`);
                return;
            }

            const manifestPath = path.join(outDir, manifestFileName);
            const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));

            for (const contentScript of manifest.content_scripts ?? []) {
                contentScript.css = [cssFileName];
            }

            await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
        },
    };
}

async function findCssFileName(outDir: string, cssFilePattern: RegExp): Promise<string | undefined> {
    const entries = await fs.readdir(outDir, { recursive: true, withFileTypes: true });

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        const fileName = path.relative(outDir, path.join(entry.parentPath, entry.name)).replaceAll(path.sep, "/");

        if (cssFilePattern.test(fileName)) {
            return fileName;
        }
    }
}
