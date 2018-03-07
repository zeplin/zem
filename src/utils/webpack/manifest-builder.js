const fs = require("fs");
const path = require("path");

class ManifestBuilder {
    constructor(extensionPath, bundleName) {
        this.extensionPath = extensionPath;
        this.bundleName = bundleName;
    }

    apply(compiler) {
        compiler.plugin("emit", (compilation, callback) => {
            const chunk = compilation.chunks.find(c => c.name === this.bundleName);

            if (!chunk) {
                return;
            }

            const manifest = {};
            const pkgInfoPath = path.join(this.extensionPath, "package.json");

            // Invalidate cached package.json content
            delete require.cache[require.resolve(pkgInfoPath)];
            const pkgInfo = require(pkgInfoPath);

            manifest.name = pkgInfo.zeplin.displayName || pkgInfo.name;
            manifest.description = pkgInfo.description;
            manifest.version = pkgInfo.version;
            manifest.author = pkgInfo.author;
            manifest.repository = pkgInfo.repository;
            manifest.options = pkgInfo.zeplin.options;
            manifest.moduleURL = `./${chunk.files[0]}`;

            if (fs.existsSync(path.join(this.extensionPath, "README.md"))) {
                manifest.readmeURL = "./README.md";
            }

            const content = JSON.stringify(manifest, null, 2);

            compilation.assets["manifest.json"] = {
                source() {
                    return content;
                },
                size() {
                    return content.length;
                }
            };
            callback();
        });
    }
}

module.exports = ManifestBuilder;