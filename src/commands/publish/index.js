const fs = require("fs-extra");
const chalk = require("chalk");
const path = require("path");
const Zip = require("adm-zip");
const prompts = require("prompts");

const paths = require("../../utils/paths");
const manifestValidator = require("./manifest-validator");
const ApiClient = require("./apiClient");
const AuthenticationService = require("./authenticationService");
const { isCI } = require("../../config/constants");
const { version: packageVersion } = require(paths.resolveExtensionPath("./package.json"));

const pathResolver = {
    init(root) {
        this.root = root;
    },
    resolve(relativePath) {
        if (this.root) {
            return path.resolve(this.root, relativePath);
        }

        return paths.resolveBuildPath(relativePath);
    }
};

function parseManifest() {
    const manifestPath = pathResolver.resolve("./manifest.json");

    if (!fs.existsSync(manifestPath)) {
        throw new Error("Locating manifest.json failed. Please make sure that you run `npm run build` first!");
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath));
    const { valid, errors } = manifestValidator(manifest);

    if (!valid) {
        throw new Error(`Validating manifest.json failed:\n${errors}\n\nPlease make sure that all fields in "package.json" are valid and you run \`npm run build\``);
    }

    if (packageVersion !== manifest.version) {
        throw new Error(
            "Validating manifest.json failed: Extension version does not match the version in manifest.json.\n" +
            "Please make sure that you run `npm run build` first!"
        );
    }

    return manifest;
}

function createArchive() {
    const archive = new Zip();

    archive.addLocalFolder(pathResolver.resolve("./"), "./");

    return archive;
}

async function confirm() {
    if (isCI) {
        return true;
    }

    const { answer } = await prompts({
        type: "confirm",
        name: "answer",
        message: "Are you sure to continue"
    });
    return answer;
}

async function validateReadme({ hasOptions }) {
    const readmePath = pathResolver.resolve("./README.md");

    if (!fs.existsSync(readmePath)) {
        throw new Error("Locating README.md failed. Please make sure that you create a readme file and run `npm run build`!");
    }

    const readme = (await fs.readFile(readmePath))
        .toString("utf8")
        .replace(/<!--(.|\n)*?-->/g, "");

    if (!readme.match(/^## Output/m)) {
        console.log(chalk.yellow("Output section could not be found in README.md"));
        if (!await confirm()) {
            throw new Error("Output section could not be found in README.md. Please make sure that you add this section and run `npm run build`!");
        }
    }

    if (hasOptions && !readme.match(/^## Options/m)) {
        console.log(chalk.yellow("Options section could not be found in README.md"));
        if (!await confirm()) {
            throw new Error("Options section could not be found in README.md. Please make sure that you add this section and run `npm run build`!");
        }
    }
}

module.exports = async function (buildPath) {
    console.log("Publishing the extension...\n");

    pathResolver.init(buildPath);

    try {
        const {
            packageName,
            version,
            name,
            description,
            platforms,
            options
        } = parseManifest();

        await validateReadme({ hasOptions: Boolean(options) });

        const authenticationService = new AuthenticationService();
        const apiClient = new ApiClient();
        const { authToken, userId } = await authenticationService.authenticate();
        const { extensions } = await apiClient.getExtensions({ authToken, owner: userId });

        const extension = extensions.find(e => e.packageName === packageName);
        const packageBuffer = createArchive().toBuffer();

        if (!extension) {
            const data = {
                packageName,
                version,
                name,
                description,
                platforms: platforms.join(","),
                packageBuffer
            };
            await apiClient.createExtension({ data, authToken });
            console.log(`${chalk.bold(name)} (${version}) is now submitted. 🏄‍️\n`);
        } else {
            await apiClient.createExtensionVersion({ authToken, extensionId: extension._id, version, packageBuffer });
            console.log(`Version ${chalk.bold(version)} of ${chalk.bold(name)} is now submitted. 🏄‍️\n`);
        }

        console.log(`Big hugs for your contribution, you'll be notified via email once it's published on ${chalk.underline("https://extensions.zeplin.io")}.`);
    } catch (error) {
        console.log(chalk.red("Publishing extension failed:"));
        console.error(error.message || error);
        throw error;
    }
};