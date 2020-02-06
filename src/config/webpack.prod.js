const merge = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
    output: {
        filename: "[name].[chunkhash:8].js"
    },
    optimization: {
        minimize: true
    }
});