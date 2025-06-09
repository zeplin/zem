const fs = require("fs");
const ESLintPlugin = require("eslint-webpack-plugin");
const ManifestBuilder = require("../utils/webpack/manifest-builder");
const { resolveBuildPath, resolveExtensionPath } = require("../utils/paths");
const { bundleName } = require("./constants");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const extensionPath = resolveExtensionPath();
const buildPath = resolveBuildPath();
const readmePath = resolveExtensionPath("README.md");

const { eslintConfig, main, exports: _exports } = require(resolveExtensionPath("package.json"));

const entryPoint = _exports?.["."]?.import ?? _exports?.["."] ?? _exports ?? main;

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

module.exports = {
    mode: "none",
    entry: { [bundleName]: entryPoint || "./src/index.js" },
    output: {
        path: buildPath,
        library: {
            name: "extension",
            type: "umd",
            export: "default"
        },
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
        ...(eslintEnabled ? [new ESLintPlugin()] : []),
        new CopyWebpackPlugin({
            patterns: [
                { from: readmePath, to: "README.md" },
                { from: "src/**", to : "src/" }
            ]
        }),
        new ManifestBuilder(extensionPath, bundleName)
    ]
};
