#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");

const commander = require("commander");
const { resolveBuildPath } = require("./utils/paths");
const { defaultHostName, defaultPort } = require("./config/constants");
const { name, version } = require(path.join(__dirname, "../package.json"));

const program = new commander.Command(name).version(version);

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

        exec(require("./config/webpack.dev"), fnName, defaultOptions, options.build);
    });

program.on("command:*", () => {
    program.outputHelp();
});

program.parse(process.argv);