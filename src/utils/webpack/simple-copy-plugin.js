const fs = require("fs");

class SimpleCopyPlugin {
    constructor(copies) {
        this.copies = copies;
    }
    apply(compiler) {
        compiler.hooks.emit.tap(this.constructor.name, compilation => {
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

                    compilation.assets[`${entry.to}`] = {
                        source() {
                            return file;
                        },
                        size() {
                            return file.length;
                        }
                    };
                });
            });
        });
    }
}

module.exports = SimpleCopyPlugin;