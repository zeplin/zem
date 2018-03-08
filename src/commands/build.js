const chalk = require("chalk");
const webpack = require("webpack");
const transformConfig = require("../utils/webpack/transform-config");

module.exports = function (webpackConfig, { throwOnError = false, printStats = true } = {}) {
    const compiler = webpack(transformConfig(webpackConfig));

    console.log("Building extension...\n");

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                return reject(err);
            }

            if (stats.hasErrors() && throwOnError) {
                const error = new Error("Compile error");
                error.name = "CompileError";
                error.stats = stats;

                return reject(error);
            }

            if (printStats) {
                console.log(`${stats.toString({
                    errors: true,
                    colors: true
                })}\n`);
            }

            if (!stats.hasErrors() && !stats.hasWarnings()) {
                console.log(chalk.green("Compiled successfully"));
            }

            return resolve({
                stats
            });
        });
    });
};