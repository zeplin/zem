const merge = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
    output: {
        filename: "[name].js",
        publicPath: "/"
    },
    devtool: "inline-source-map"
});