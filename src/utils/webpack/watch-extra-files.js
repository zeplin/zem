class WatchExtraFilesPlugin {
    constructor({ files = [] } = {}) {
        this.files = files;
    }

    apply(compiler) {
        compiler.plugin("after-compile", (compilation, callback) => {
            this.files.map(f => compilation.fileDependencies.push(f));
            callback();
        });
    }
}

module.exports = WatchExtraFilesPlugin;