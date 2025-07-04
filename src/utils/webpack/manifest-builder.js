import fs from "fs-extra";
import path from "node:path";
import webpack from "webpack";

const { Compilation, sources } = webpack;

function parseShortcutRepoUrl(shortcutUrl) {
    if (shortcutUrl.startsWith("http")) {
        return shortcutUrl;
    }

    const match = shortcutUrl.match(/(?:([a-z]+):)?(.*)/i);

    if (!match) {
        return;
    }

    const [type, id] = match.slice(1);

    switch (type) {
        case "gist":
            return `https://gist.github.com/${id}`;
        case "bitbucket":
            return `https://bitbucket.org/${id}`;
        case "gitlab":
            return `https://gitlab.com/${id}`;
        case "github":
            return `https://github.com/${id}`;
        default:
            if (/[^/]+\/[^/]+/.test(id)) {
                return `https://github.com/${id}`;
            }
    }
}

function parseRepository(repoInfo) {
    if (typeof repoInfo === "string") {
        return parseShortcutRepoUrl(repoInfo);
    }

    return repoInfo.url;
}

export default class ManifestBuilder {
    constructor(extensionPath, bundleName) {
        this.extensionPath = extensionPath;
        this.bundleName = bundleName;
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(this.constructor.name, compilation => {
            compilation.hooks.processAssets.tap({
                name: this.constructor.name,
                stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
            }, () => {
                const chunk = Array.from(compilation.chunks).find(c => c.name === this.bundleName);

                if (!chunk) {
                    return;
                }

                const manifest = {};
                const pkgInfoPath = path.join(this.extensionPath, "package.json");

                // Invalidate cached package.json content
                // delete require.cache[require.resolve(pkgInfoPath)];
                const pkgInfo = fs.readJSONSync(pkgInfoPath);

                manifest.packageName = pkgInfo.name;
                manifest.name = pkgInfo.zeplin && pkgInfo.zeplin.displayName || pkgInfo.name;
                manifest.description = pkgInfo.description;
                manifest.version = pkgInfo.version;
                manifest.author = pkgInfo.author;
                manifest.options = pkgInfo.zeplin && pkgInfo.zeplin.options;
                manifest.platforms = pkgInfo.zeplin && (pkgInfo.zeplin.platforms || pkgInfo.zeplin.projectTypes);
                manifest.moduleURL = `./${chunk.files.keys().next().value}`;

                if (pkgInfo.repository) {
                    manifest.repository = parseRepository(pkgInfo.repository);
                }

                if (fs.existsSync(path.join(this.extensionPath, "README.md"))) {
                    manifest.readmeURL = "./README.md";
                }

                const content = JSON.stringify(manifest, null, 2);

                compilation.emitAsset("manifest.json", new sources.RawSource(content));
            });
        });
    }
}
