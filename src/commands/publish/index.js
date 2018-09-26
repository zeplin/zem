const fs = require("fs-extra");
const chalk = require("chalk");
const path = require("path");
const Zip = require("adm-zip");
const prompts = require("prompts");
const paths = require("../../utils/paths");
const manifestValidator = require("./manifest-validator");
const apiClient = require("./zeplin-api");

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
        throw new Error("Could not find manifest.json file!");
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath));
    const { valid, validationErrors } = manifestValidator(manifest);

    if (!valid) {
        throw new Error(`Invalid manifest.json file:\n${validationErrors}`);
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
            projectTypes
        } = manifest;

        if (!extension) {
            extension = await apiClient.createExtension({
                packageName,
                version,
                name,
                description,
                projectTypes: projectTypes.join(","),
                packageBuffer
            });
        } else {
            await apiClient.createExtensionVersion(extension._id, version, packageBuffer);
        }

        console.log(chalk.blue(`${packageName}@${version} is submitted!\n`));
        console.log("You'll be notified once it's published on extensions.zeplin.io.");
    } catch (error) {
        console.log(chalk.red("Couldn't publish the extension:"));
        console.error(error.message || error);
    }
};