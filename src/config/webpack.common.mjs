import ESLintPlugin from "eslint-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import ManifestBuilder from "../utils/webpack/manifest-builder.js";
import { resolveBuildPath, resolveExtensionPath } from "../utils/paths.js";
import { constants } from "./constants.js";
import { getPackageJson } from "../utils/package.js";
import { findESLintConfig } from "../utils/eslint.js";

const extensionPath = resolveExtensionPath();
const buildPath = resolveBuildPath();
const readmePath = resolveExtensionPath("README.md");

const { main, exports: _exports } = getPackageJson() || {};

const entryPoint = (_exports?.["."]?.import ?? _exports?.["."] ?? _exports ?? main) || "./src/index.js";

const eslintConfig = findESLintConfig(entryPoint);

export default {
    mode: "none",
    entry: { [constants.bundleName]: entryPoint },
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
            use: [{
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
            }]
        }]
    },
    plugins: [
        ...(eslintConfig ? [new ESLintPlugin(eslintConfig)] : []),
        new CopyWebpackPlugin({
            patterns: [
                { from: readmePath, to: "README.md" },
                { from: "src/**" }
            ]
        }),
        new ManifestBuilder(extensionPath, constants.bundleName)
    ]
};
