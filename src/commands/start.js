const chalk = require("chalk");
const WebpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");
const webpackConfig = require("../config/webpack.dev");
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
    const serverConfig = Object.assign({}, webpackConfig.devServer, {
        host: host || webpackConfig.devServer.host,
        port: port || webpackConfig.devServer.port,
        allowedHosts: allowedHosts ? allowedHosts.split(",") : webpackConfig.devServer.allowedHosts
    });

    const server = new WebpackDevServer(serverConfig, compiler);

    const startServer = async () => {
        try {
            await server.start();
            console.log(`Extension is served from ${chalk.blue.bold(`http://${serverConfig.host}:${serverConfig.port}/manifest.json`)}\n`);
        } catch (err) {
            console.log(err);
        }
    };

    startServer();

    const closeServer = async () => {
        await server.stop();
        process.exit();
    };

    process.on("SIGTERM", closeServer);
    process.on("SIGINT", closeServer);
    process.on("warning", warning => {
        console.log(warning.stack);
    });
};