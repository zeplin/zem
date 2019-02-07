const merge = require("webpack-merge");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const ManifestBuilder = require("../utils/webpack/manifest-builder");
const common = require("./webpack.common");
const { resolveExtensionPath } = require("../utils/paths");
const { bundleName } = require("./constants");

const extensionPath = resolveExtensionPath();

common.plugins.push(
    // Build prod manifest
    new ManifestBuilder(extensionPath, bundleName),

    // Minify
    new UglifyJSPlugin({
        sourceMap: true
    })
);

module.exports = merge(common, {
    output: {
        filename: "[name].[chunkhash:8].js"
    }
});