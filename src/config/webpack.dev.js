const merge = require("webpack-merge");
const common = require("./webpack.common");
const ManifestBuilder = require("../utils/webpack/manifest-builder");
const { resolveExtensionPath } = require("../utils/paths");
const { bundleName } = require("./constants");

const extensionPath = resolveExtensionPath();

// Build dev manifest
common.plugins.push(new ManifestBuilder(extensionPath, bundleName, true));

module.exports = merge(common, {
    output: {
        filename: "[name].js",
        publicPath: "/"
    },
    devtool: "inline-source-map"
});