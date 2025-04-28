const fs = require("fs");
const { Compilation, sources } = require("webpack");

class SimpleCopyPlugin {
    constructor(copies) {
        this.copies = copies;
    }
    apply(compiler) {
        compiler.hooks.compilation.tap(this.constructor.name, compilation => {
            compilation.hooks.processAssets.tap({
                name: this.constructor.name,
                stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
            }, () => {
                compilation.chunks.forEach(chunk => {
                    const copyEntries = this.copies[chunk.name];
                    if (!copyEntries) {
                        throw new Error(`Copy entry not found`);
                    }

                    copyEntries.forEach(entry => {
                        if (!fs.existsSync(entry.from)) {
                            console.log(`Skipping copying file ${entry.from} since it does not exist`);
                            return;
                        }

                        let file = fs.readFileSync(entry.from);

                        if (entry.transform && typeof entry.transform === "function") {
                            file = entry.transform(file, chunk.files[0]);
                        }

                        compilation.emitAsset(`${entry.to}`, new sources.RawSource(file));
                    });
                });
            });
        });
    }
}

module.exports = SimpleCopyPlugin;