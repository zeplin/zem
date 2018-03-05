const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const { spawn } = require("child_process");

const packageName = "git+ssh://git@github.com/dirtybit/zeplin-extension-manager.git#feature/zeplin-extension-manager";

function installDeps() {
    return new Promise((resolve, reject) => {
        const npmArgs = ["install", "--save", packageName];
        const child = spawn("npm", npmArgs, { stdio: "inherit" });

        child.on("close", exitCode => {
            if (exitCode !== 0) {
                reject();
                return;
            }

            resolve();
        });
    });
}

function create(root) {
    const extensionName = path.basename(root);
    console.log(root);

    if (fs.existsSync(root)) {
        console.log(chalk.red("Creating extension failed, directory already exists."));
        process.exit(1);
    }

    fs.mkdirpSync(root);

    // TODO: Read version, description, author info from the user!
    const packageJson = {
        name: extensionName,
        version: "0.1.0",
        description: "Sample Zeplin extension",
        scripts: {
            start: "zeplin-extension-manager start",
            build: "zeplin-extension-manager build",
            clean: "zeplin-extension-manager clean",
            exec: "zeplin-extension-manager exec"
        }
    };

    fs.writeFileSync(path.resolve(root, "package.json"), JSON.stringify(packageJson, null, 2));

    const templatePath = path.join(__dirname, "../template");

    fs.copySync(templatePath, root);

    process.chdir(root);

    installDeps();
}

module.exports = create;