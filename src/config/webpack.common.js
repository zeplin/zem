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
    loader: "babel-loader",
    options: {
        presets: [
            [
                "@babel/preset-env",
                {
                    useBuiltIns: "usage",
                    corejs: 3,
                    modules: false, // Should be false to run tree shaking. See: https://webpack.js.org/guides/tree-shaking/
                    targets: {
                        chrome: 62,
                        safari: 11,
                        firefox: 59,
                        edge: 15
                    }
                }
            ]
        ]
    }
}];

if (eslintEnabled) {
    jsLoaders.push("eslint-loader");
}

module.exports = {
    mode: "none",
    entry: { [bundleName]: entryPoint || "./src/index.js" },
    output: {
        path: buildPath,
        library: "extension",
        libraryExport: "default",
        libraryTarget: "umd",
        globalObject: "typeof self !== 'undefined' ? self : this"
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
