const config = require("./webpack.dev");

module.exports = {
    stats: "none",
    port: 7070,
    publicPath: config.output.publicPath,
    watchContentBase: true,
    disableHostCheck: true,
    headers: {
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Range",
        "Access-Control-Allow-Origin": "*"
    },
    hot: false,
    inline: false
};