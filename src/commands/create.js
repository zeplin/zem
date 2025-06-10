const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const { spawn } = require("child_process");
const prompts = require("prompts");
const { title } = require("case");

const { name } = require("../../package.json");

const JSON_INDENT = 2;
const EXIT_CODE_FOR_SIGTERM = 130;

const installDeps = () => new Promise((resolve, reject) => {
    const npmArgs = ["install", "--save", name];
    const child = spawn("npm", npmArgs, { stdio: "inherit", shell: true });

    child.on("close", exitCode => {
        if (exitCode !== 0) {
            reject();
            return;
        }

        resolve();
    });
});

const getDefaultConfig = packageName => ({
    packageName,
    description: "",
    displayName: title(packageName),
    platforms: []
});

const getConfig = async defaultPackageName => {
    const response = await prompts([
        {
            type: "text",
            name: "packageName",
            message: "Package name:",
            initial: defaultPackageName
        },
        {
            type: "text",
            name: "description",
            message: "Description:"
        },
        {
            type: "text",
            name: "displayName",
            message: "Display name:",
            initial: title(defaultPackageName)
        },
        {
            type: "multiselect",
            name: "platforms",
            message: "Platforms:",
            min: 1,
            choices: [
                { name: "Web", value: "web" },
                { name: "Android", value: "android" },
                { name: "iOS", value: "ios" },
                { name: "macOS", value: "osx" }
            ],
            instructions: false,
            hint: `Press ${chalk.blue("←")}/${chalk.blue("→")}/${chalk.green("[space]")} to select choices`
        }
    ]);

    if (!response.platforms) {
        process.exit(EXIT_CODE_FOR_SIGTERM);
    }

    return response;
};

const createPackageJson = (root, { packageName, description, displayName, platforms }) => {
    const packageJson = {
        name: packageName,
        version: "0.1.0",
        description,
        type: "module",
        exports: `./${constants.buildDirName}/${constants.bundleName}.js`,
        sideEffects: false,
        scripts: {
            start: "tsc && zem start",
            build: "tsc && zem build",
            clean: "zem clean",
            exec: "tsc && zem exec",
            test: "tsc && zem test",
            publish: "tsc && zem publish",
            lint: "eslint src/ --ext .js,.ts"
        },
        dependencies: {
            "@zeplin/extension-model": "^3.0.0",
            "zem": "^2.0.0"
        },
        devDependencies: {
            "@eslint/js": "^9.26.0",
            "@types/jest": "^29.5.14",
            "eslint": "^9.26.0",
            "globals": "^16.1.0",
            "jest": "^29.7.0",
            "ts-jest": "^29.3.4",
            "typescript": "^5.8.3",
            "typescript-eslint": "^8.34.0"
        },
        engines: {
            "node": ">=20"
        },
        keywords: [
            "zeplin",
            "extension",
        ],
        zeplin: {
            displayName,
            platforms
        }
    };

    return fs.writeFile(path.resolve(root, "package.json"), JSON.stringify(packageJson, null, JSON_INDENT));
};

const generateReadme = async options => {
    const readmeTemplate = (await fs.readFile("./README.md"))
        .toString("utf8");

    const overrideOptions = {
        description: options.description || "<!--- Sample description --->"
    };

    const readme = Object
        .entries(Object.assign({}, options, overrideOptions))
        .reduce(
            (template, [key, value]) => template.replace(new RegExp(`{{${key}}}`, "g"), value),
            readmeTemplate
        );
    return fs.writeFile("./README.md", readme);
};

const create = async ({ root, disablePrompt }) => {
    if (fs.existsSync(root)) {
        console.log(chalk.red("Creating extension failed, directory already exists."));
        process.exit(1);
    }

    const defaultPackageName = path.basename(root);

    const config = disablePrompt ? getDefaultConfig(defaultPackageName) : await getConfig(defaultPackageName);

    await fs.mkdir(root);

    const templatePath = path.join(__dirname, "../template");

    await Promise.all([
        createPackageJson(root, config),
        fs.copy(templatePath, root)
    ]);

    process.chdir(root);

    await Promise.all([
        installDeps(),
        generateReadme(config)
    ]);

    console.log(`\n✅ Created extension at ${chalk.blue(root)}.\n`);
    console.log(`To get started, see documentation at ${chalk.underline("https://github.com/zeplin/zeplin-extension-documentation")}.`);
};

module.exports = create;
