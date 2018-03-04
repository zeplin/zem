const fs = require("fs");
const manifestTransformer = require("../utils/webpack/manifest-transformer");
const SimpleCopyPlugin = require("../utils/webpack/simple-copy-plugin");
const WatchExtraFilesPlugin = require("../utils/webpack/watch-extra-files");
const { resolveBuildPath, resolveExtensionPath } = require("../utils/paths");
const { bundleName } = require("./constants");

const manifestPath = resolveExtensionPath("manifest.json");
const readmePath = resolveExtensionPath("README.md");

const copies = {
    [bundleName]: [
        { from: manifestPath, to: "manifest.json", transform: manifestTransformer },
        { from: readmePath, to: "README.md" }
    ]
};
const { eslintConfig } = require(resolveExtensionPath("package.json"));
const eslintEnabled = eslintConfig || fs.readdirSync(resolveExtensionPath()).find(f => f.startsWith(".eslintrc"));
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
    entry: { [`${bundleName}`]: "./src/index.js" },
    output: {
        path: resolveBuildPath(),
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
            files: [manifestPath, readmePath]
        })
    ]
};