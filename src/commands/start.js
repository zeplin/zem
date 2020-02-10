const chalk = require("chalk");
const WebpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");
const webpackConfig = require("../config/webpack.dev");
const devServerConfig = require("../config/dev-server");
const transformConfig = require("../utils/webpack/transform-config");

function createCompiler(config) {
    let compiler;
    try {
        compiler = webpack(config);
    } catch (err) {
        console.log(chalk.red("Compilation failed:"));
        console.error(err.message || err);
        process.exit(1);
    }

    compiler.hooks.done.tap("logStatPlugin", stats => {
        console.log(stats.toString({
            errors: true,
            colors: true
        }));
    });

    return compiler;
}

module.exports = function (host, port, allowedHosts) {
    const compiler = createCompiler(transformConfig(webpackConfig));
    const serverConfig = Object.assign({}, devServerConfig);

    if (allowedHosts) {
        serverConfig.allowedHosts = allowedHosts.split(",");
    }

    const server = new WebpackDevServer(compiler, devServerConfig);

    server.listen(port, host, err => {
        if (err) {
            return console.log(err);
        }

        console.log(`Extension is served from ${chalk.blue.bold(`http://${host}:${port}/manifest.json`)}\n`);
    });

    const closeServer = () => {
        server.close();
        process.exit();
    };

    process.on("SIGTERM", closeServer);
    process.on("SIGINT", closeServer);
    process.on("warning", warning => {
        console.log(warning.stack);
    });
};