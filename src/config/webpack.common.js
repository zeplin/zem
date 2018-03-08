const fs = require("fs");
const ManifestBuilder = require("../utils/webpack/manifest-builder");
const SimpleCopyPlugin = require("../utils/webpack/simple-copy-plugin");
const WatchExtraFilesPlugin = require("../utils/webpack/watch-extra-files");
const { resolveBuildPath, resolveExtensionPath } = require("../utils/paths");
const { bundleName } = require("./constants");

const extensionPath = resolveExtensionPath();
const buildPath = resolveBuildPath();
const readmePath = resolveExtensionPath("README.md");

const copies = {
    [bundleName]: [
        { from: readmePath, to: "README.md" }
    ]
};
const { eslintConfig, main: entryPoint } = require(resolveExtensionPath("package.json"));
const eslintEnabled = eslintConfig || fs.readdirSync(extensionPath).find(f => f.startsWith(".eslintrc"));
const jsLoaders = [{
    loader: require.resolve("babel-loader"),
    options: {
        presets: [
            [require.resolve("babel-preset-env"), {
                targets: {
                    browsers: ["chrome >= 45", "safari >= 9.1", "firefox >= 45"]
                }
            }]
        ]
    }
}];

if (eslintEnabled) {
    jsLoaders.push(require.resolve("eslint-loader"));
}

module.exports = {
    entry: { [bundleName]: entryPoint || "./src/index.js" },
    output: {
        path: buildPath,
        library: "extension",
        libraryExport: "default",
        libraryTarget: "umd"
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: jsLoaders
        }]
    },
    plugins: [
        new SimpleCopyPlugin(copies),
        new WatchExtraFilesPlugin({
            files: [resolveExtensionPath("package.json"), readmePath]
        }),
        new ManifestBuilder(extensionPath, bundleName)
    ]
};