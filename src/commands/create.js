const chalk = require("chalk");
const fs = require("fs-extra");
const path = require("path");
const { spawn } = require("child_process");

const packageName = "zem";

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

    if (fs.existsSync(root)) {
        console.log(chalk.red("Creating extension failed, directory already exists."));
        process.exit(1);
    }

    fs.mkdirpSync(root);

    const packageJson = {
        name: extensionName,
        version: "0.1.0",
        description: "Sample extension description.",
        scripts: {
            start: "zem start",
            build: "zem build",
            clean: "zem clean",
            exec: "zem exec"
        },
        zeplin: {
            displayName: extensionName,
            projectTypes: ["web"]
        }
    };

    fs.writeFileSync(path.resolve(root, "package.json"), JSON.stringify(packageJson, null, 2));

    const templatePath = path.join(__dirname, "../template");

    fs.copySync(templatePath, root);

    process.chdir(root);

    installDeps().then(() => {
        console.log(`\n✅ Created extension at ${chalk.blue(root)}.\n`);
        console.log(`To get started, see documentation at ${chalk.underline("https://github.com/zeplin/zeplin-extension-documentation")}.`);
    });
}

module.exports = create;