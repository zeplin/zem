import chalk from "chalk";
import webpack from "webpack";
import transformConfig from "../utils/webpack/transform-config.js";

export default async function (webpackConfig, { throwOnError = false, printStats = true } = {}) {
    const options = await transformConfig(webpackConfig);
    const compiler = webpack(options);

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