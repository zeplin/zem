#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const updateNotifier = require("update-notifier");
const commander = require("commander");

const { resolveBuildPath } = require("./utils/paths");
const { defaultHostName, defaultPort } = require("./config/constants");
const { name, version } = require(path.join(__dirname, "../package.json"));

const seconds = 60;
const minutes = 60;
const hours = 24;
const days = 5;
const updateCheckInterval = days * hours * minutes * seconds;

function beforeCommand() {
    const notifier = updateNotifier({
        pkg: { name, version },
        shouldNotifyInNpmScript: true,
        updateCheckInterval
    });
    notifier.notify();
}

const program = new commander.Command(name).version(version);
const TEST_ARGS_INDEX = 3;

program
    .command("create <dir>")
    .description("Create empty Zeplin extension at directory.")
    .option("-y --yes", "Create extension without prompt for configuration")
    .action((extensionDir, { yes }) => {
        const create = require("./commands/create");
        const root = path.resolve(process.cwd(), extensionDir);

        return create({ root, disablePrompt: yes });
    });

program
    .command("build")
    .description("Create build, targeting production environment.")
    .option("-d --dev", "Target development environment")
    .action(options => {
        const build = require("./commands/build");

        build(require(`./config/webpack.${options.dev ? "dev" : "prod"}`));
    });

program
    .command("clean")
    .description("Clean build directory.")
    .action(() => {
        fs.remove(resolveBuildPath());
    });

program
    .command("start")
    .description("Start local server, serving the extension.")
    .option("-h --host <host>", "Host name", defaultHostName)
    .option("-p --port <port>", "Port", defaultPort)
    .option("-a --allowed-hosts <allowed-hosts>", "Allowed hosts")
    .action(command => {
        const start = require("./commands/start");

        start(command.host, command.port, command.allowedHosts);
    });

program
    .command("exec [function-name]")
    .description("Execute extension function with sample data.")
    .option("--no-build", "Use existing build.")
    .option("--defaults <default-options>", `Set default extension option values (e.g, flag=false,prefix=\\"pre\\")`)
    .action((fnName, options) => {
        const exec = require("./commands/exec");
        let defaultOptions;

        if (options.defaults) {
            defaultOptions = {};

            options.defaults.split(",").forEach(keyValue => {
                const [key, value] = keyValue.split("=");

                defaultOptions[key] = JSON.parse(value);
            });
        }

        exec(require("./config/webpack.exec"), fnName, defaultOptions, options.build);
    });

program
    .command("publish")
    .description(`Publish extension, submitting it for review to be listed on ${chalk.underline("https://extensions.zeplin.io.")}`)
    .option("--path <build-path>", `Path for the extension build to be published`)
    .option("--verbose", "Enables verbose logs")
    .action(async ({ path: buildPath, verbose }) => {
        const publish = require("./commands/publish");
        try {
            await publish({ buildPath, verbose });
        } catch (_) {
            process.exitCode = 1;
        }
    });

program
    .command("test")
    .description(`Test via jest`)
    .allowUnknownOption()
    .action(command => {
        const test = require("./commands/test");

        test(process.argv.slice(TEST_ARGS_INDEX));
    });

program.on("command:*", () => {
    program.outputHelp();
});

beforeCommand();
program.parse(process.argv);
