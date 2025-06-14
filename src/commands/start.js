import chalk from "chalk";
import WebpackDevServer from "webpack-dev-server";
import webpack from "webpack";
import transformConfig from "../utils/webpack/transform-config.js";
import devWebpackConfig from "../config/webpack.dev.mjs";

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

export default async function (host, port, allowedHosts) {
    const config = await transformConfig(devWebpackConfig);
    const compiler = createCompiler(config);

    const serverConfig = {
        ...devWebpackConfig.devServer,
        host: host || devWebpackConfig.devServer.host,
        port: port || devWebpackConfig.devServer.port,
        allowedHosts: allowedHosts ? allowedHosts.split(",") : devWebpackConfig.devServer.allowedHosts
    };

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