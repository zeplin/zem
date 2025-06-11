import chalk from "chalk";
import fs from "fs-extra";
import { resolveExtensionPath } from "../paths.js";

export default async function (config) {
    const userConfigPath = resolveExtensionPath("webpack.zem.js");

    try {
        if (fs.existsSync(userConfigPath)) {
            const transformer =  (await import(userConfigPath)).default;

            return transformer(config);
        }
    } catch (error) {
        console.log(chalk.red(`An error occurred while applying user config:`));
        console.error(error);
        console.log(chalk.yellow("Falling back to default build configuration!"));
    }

    return config;
};