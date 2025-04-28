const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const { resolveExtensionPath } = require("../utils/paths");

const readmePath = resolveExtensionPath("README.md");
const packageJsonPath = resolveExtensionPath("package.json");

module.exports = merge(common, {
    output: {
        filename: "[name].js",
        publicPath: "/"
    },
    devtool: "inline-source-map",
    devServer: {
        hot: true,
        host: "local-ip",
        port: 7070,
        allowedHosts: "all",
        watchFiles: [packageJsonPath, readmePath],
        headers: {
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Range",
            "Access-Control-Allow-Origin": "*"
        },
        // Disable cross-origin header check to allow the extension to be installed from a different origin.
        // Might be removed after the following issue is resolved:
        // https://github.com/webpack/webpack-dev-server/issues/5446#issuecomment-2768816082
        setupMiddlewares: middlewares => middlewares.filter(middleware => middleware.name !== "cross-origin-header-check")
    }
});