#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");

const commander = require("commander");
const { resolveBuildPath } = require("./utils/paths");
const { defaultHostName, defaultPort } = require("./config/constants");
const { name, version } = require(path.join(__dirname, "../package.json"));

const program = new commander.Command(name).version(version);
const TEST_ARGS_INDEX = 3;

program
    .command("create <dir>")
    .description("Create empty Zeplin extension at directory.")
    .action(extensionDir => {
        const create = require("./commands/create");
        const root = path.resolve(process.cwd(), extensionDir);

        create(root);
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
    .command("publish")
    .description(`Publish extension, submitting it for review to be listed on ${chalk.underline("https://extensions.zeplin.io.")}`)
    .option("--path <build-path>", `Path for the extension build to be published`)
    .action(command => {
        const publish = require("./commands/publish");

        publish(command.path);
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

program.parse(process.argv);