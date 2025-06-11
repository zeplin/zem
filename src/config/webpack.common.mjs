import fs from "fs-extra";
import ESLintPlugin from "eslint-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import ManifestBuilder from "../utils/webpack/manifest-builder.js";
import { resolveBuildPath, resolveExtensionPath } from "../utils/paths.js";
import { constants } from "./constants.js";

const extensionPath = resolveExtensionPath();
const buildPath = resolveBuildPath();
const readmePath = resolveExtensionPath("README.md");

const path = resolveExtensionPath("package.json");

const { eslintConfig, main, exports: _exports } = fs.readJSONSync(path);

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

export default {
    mode: "none",
    entry: { [constants.bundleName]: entryPoint || "./src/index.js" },
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
            test: /\.(?:js|mjs|cjs)$/,
            exclude: /node_modules/,
            use: jsLoaders
        }]
    },
    plugins: [
        ...(eslintEnabled ? [new ESLintPlugin()] : []),
        new CopyWebpackPlugin({
            patterns: [
                { from: readmePath, to: "README.md" },
                { from: "src/**" }
            ]
        }),
        new ManifestBuilder(extensionPath, constants.bundleName)
    ]
};
