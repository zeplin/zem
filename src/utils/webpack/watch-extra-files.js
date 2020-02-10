class WatchExtraFilesPlugin {
    constructor({ files = [] } = {}) {
        this.files = files;
    }

    apply(compiler) {
        compiler.hooks.afterCompile.tap(this.constructor.name, compilation => {
            this.files.map(f => compilation.fileDependencies.add(f));
        });
    }
}

module.exports = WatchExtraFilesPlugin;