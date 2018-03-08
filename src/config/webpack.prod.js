const merge = require("webpack-merge");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const common = require("./webpack.common");

common.plugins.push(new UglifyJSPlugin({
    sourceMap: true
}));

module.exports = merge(common, {
    output: {
        filename: "[name].[chunkhash:8].js"
    }
});