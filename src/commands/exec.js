const fs = require("fs");
const chalk = require("chalk");
const build = require("./build");
const highlightSyntax = require("../utils/highlight-syntax");
const sampleData = require("../sample-data");
const { bundleName } = require("../config/constants");
const { resolveBuildPath, resolveExtensionPath } = require("../utils/paths");
const {
    Layer,
    Project,
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

function printCodeData(codeData, title) {
    if (title) {
        console.log(chalk.bold(title));
    }

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

function callExtensionFunction(extension, fnName, ...args) {
    return Promise.resolve()
        .then(() => {
            if (typeof extension[fnName] !== "function") {
                return;
            }

            return extension[fnName](...args);
        }).catch(error => {
            return chalk.red(error.stack);
        });
}

function executeLayer(extension, context) {
    const layers = sampleData.layers.map(data => new Layer(data));

    return Promise.all(
        layers.map(layer => callExtensionFunction(extension, "layer", context, layer))
    ).then(results => {
        console.log(chalk.underline.bold("\nLayers:"));

        results.forEach((codeData, index) => {
            printCodeData(codeData, `${layers[index].name}:`);
        });
    });
}

function executeColors(extension, context) {
    return callExtensionFunction(extension, "colors", context).then(codeData => {
        console.log(chalk.underline.bold("\nColors (Project):"));

        printCodeData(codeData);
    });
}

function executeTextStyles(extension, context) {
    return callExtensionFunction(extension, "textStyles", context).then(codeData => {
        console.log(chalk.underline.bold("\nText styles (Project):"));

        printCodeData(codeData);
    });
}

const EXTENSION_FUNCTIONS = {
    layer: executeLayer,
    colors: executeColors,
    textStyles: executeTextStyles
};

function executeFunction(extension, fnName, context) {
    const fn = EXTENSION_FUNCTIONS[fnName];

    if (!fn) {
        console.log(chalk.yellow(`Function “${fnName}” not defined.`));
        return;
    }

    fn(extension, context);
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
    executeFunction(extension, "colors", context);
    executeFunction(extension, "textStyles", context);
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