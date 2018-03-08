const fs = require("fs");
const chalk = require("chalk");
const build = require("./build");
const highlightSyntax = require("../utils/highlight-syntax");
const sampleData = require("../sample-data");
const { bundleName } = require("../config/constants");
const { resolveBuildPath, resolveExtensionPath } = require("../utils/paths");
const {
    Layer,
    Color,
    Project,
    TextStyle,
    Context
} = require("@zeplin/extension-model");

function getManifestDefaults() {
    const manifest = require(resolveExtensionPath("dist/manifest.json"));

    if (!manifest.options) {
        return {};
    }

    return manifest.options.reduce((defaultOptions, option) => {
        defaultOptions[option.id] = option.default;

        return defaultOptions;
    }, {});
}

function printCodeData(codeData) {
    if (!codeData) {
        return;
    }

    let output;

    if (typeof codeData === "string") {
        output = codeData;
    } else {
        const { code, language } = codeData;

        try {
            output = highlightSyntax(code, language);
        } catch (error) {
            output = code;
        }
    }

    console.log(output);
}

function executeFunction(extension, fnName, context) {
    if (fnName === "layer" && typeof extension.layer === "function") {
        console.log(chalk.underline.bold("\nLayers:"));
        sampleData.layers.forEach((data, index) => {
            const layer = new Layer(data);

            console.log(chalk.bold(`${index !== 0 ? "\n" : ""}${layer.name}:`));
            printCodeData(extension.layer(context, layer));
        });
    } else if (fnName === "styleguideColors" && typeof extension.styleguideColors === "function") {
        console.log(chalk.underline.bold("\nColors:"));
        printCodeData(extension.styleguideColors(context, sampleData.project.colors.map(data => new Color(data))));
    } else if (fnName === "styleguideTextStyles" && typeof extension.styleguideTextStyles === "function") {
        console.log(chalk.underline.bold("\nText styles:"));
        printCodeData(
            extension.styleguideTextStyles(context, sampleData.project.textStyles.map(data => new TextStyle(data)))
        );
    } else {
        console.log(chalk.yellow(`Function “${fnName}” not defined.`));
    }
}

function executeExtension(extension, fnName, defaultOptions = {}) {
    const project = new Project(sampleData.project);
    const options = Object.assign(getManifestDefaults(), defaultOptions);
    const context = new Context({
        options,
        project
    });

    if (fnName) {
        executeFunction(extension, fnName, context);
        return;
    }

    executeFunction(extension, "layer", context);
    executeFunction(extension, "styleguideColors", context);
    executeFunction(extension, "styleguideTextStyles", context);
}

module.exports = function (webpackConfig, fnName, defaultOptions, shouldBuild) {
    const extensionModulePath = resolveBuildPath(bundleName);
    let moduleBuild;

    if (!shouldBuild && fs.existsSync(`${extensionModulePath}.js`)) {
        moduleBuild = Promise.resolve();
    } else {
        moduleBuild = build(webpackConfig, { throwOnError: true, printStats: false });
    }

    return moduleBuild.then(() => {
        try {
            const extension = require(extensionModulePath);

            console.log(`Executing extension${fnName ? ` function ${chalk.blue(fnName)}` : ""} with sample data...`);

            executeExtension(extension, fnName, defaultOptions);
        } catch (error) {
            console.error(chalk.red("Execution failed:"), error);
        }
    }).catch(error => {
        console.log(chalk.red("Execution failed: cannot build the extension"));
        console.error(error.stats.toJson().errors.join("\n"));
    });
};