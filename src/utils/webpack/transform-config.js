const chalk = require("chalk");
const fs = require("fs");
const { resolveExtensionPath } = require("../paths");

module.exports = function (config) {
    const userConfigPath = resolveExtensionPath("webpack.zem.js");

    try {
        if (fs.existsSync(userConfigPath)) {
            const transformer = require(userConfigPath);

            return transformer(config);
        }
    } catch (error) {
        console.log(chalk.red(`An error occurred while applying user config:`));
        console.error(error);
        console.log(chalk.yellow("Falling back to default build configuration!"));
    }

    return config;
};