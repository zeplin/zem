const fs = require("fs-extra");
const chalk = require("chalk");
const path = require("path");
const Zip = require("adm-zip");
const prompts = require("prompts");
const paths = require("../../utils/paths");
const manifestValidator = require("./manifest-validator");
const apiClient = require("./zeplin-api");
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
    const { valid, validationErrors } = manifestValidator(manifest);

    if (!valid) {
        throw new Error(`Validating manifest.json failed:\n${validationErrors}`);
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

function promptLogin() {
    const questions = [
        {
            type: "text",
            name: "handle",
            message: "Username or email address: "
        },
        {
            type: "password",
            name: "password",
            message: "Password"
        }
    ];

    return prompts(questions);
}

async function login() {
    const { handle, password } = await promptLogin();

    return apiClient.auth({ handle, password });
}

async function authenticate() {
    if (apiClient.hasToken()) {
        try {
            return await apiClient.auth();
        } catch (err) {
            return login();
        }
    }

    return login();
}

module.exports = async function (buildPath) {
    console.log("Publishing the extension...\n");

    pathResolver.init(buildPath);

    try {
        await authenticate();

        const manifest = parseManifest();
        const { extensions } = await apiClient.getExtensions();
        let extension = extensions.find(e => e.packageName === manifest.packageName);
        const packageBuffer = createArchive().toBuffer();
        const {
            packageName,
            version,
            name,
            description,
            platforms
        } = manifest;

        if (!extension) {
            extension = await apiClient.createExtension({
                packageName,
                version,
                name,
                description,
                platforms: platforms.join(","),
                packageBuffer
            });
            console.log(`${chalk.bold(name)} (${version}) is now submitted. 🏄‍♂️\n`);
        } else {
            await apiClient.createExtensionVersion(extension._id, version, packageBuffer);
            console.log(`Version ${chalk.bold(version)} of ${chalk.bold(name)} is now submitted. 🏄‍♂️\n`);
        }

        console.log(`Big hugs for your contribution, you'll be notified via email once it's published on ${chalk.underline("https://extensions.zeplin.io")}.`);
    } catch (error) {
        console.log(chalk.red("Publishing extension failed:"));
        console.error(error.message || error);
    }
};