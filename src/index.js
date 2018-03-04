#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");

const commander = require("commander");
const { resolveBuildPath } = require("./utils/paths");
const { defaultHostName, defaultPort } = require("./config/constants");
const { name, version } = require(path.join(__dirname, "../package.json"));

const program = new commander.Command(name).version(version);

program
    .command("create <extension-dir>")
    .description("Creates an initial Zeplin extension package on the given path")
    .action(extensionDir => {
        const create = require("./commands/create");
        const root = path.resolve(process.cwd(), extensionDir);

        create(root);
    });

program
    .command("build")
    .description("Create a build targeting the prod environment")
    .option("-d --dev", "Use config for development environment")
    .action(options => {
        const build = require("./commands/build");

        build(require(`./config/webpack.${options.dev ? "dev" : "prod"}`));
    });

program
    .command("clean")
    .description("Clean the build directory")
    .action(() => {
        fs.remove(resolveBuildPath());
    });

program
    .command("start")
    .description("Start a local server to serve extension")
    .option("-h --host <host>", "Host name", defaultHostName)
    .option("-p --port <port>", "Port", defaultPort)
    .option("-a --allowed-hosts <allowed-hosts>", "Allowed hosts")
    .action(command => {
        const start = require("./commands/start");

        start(command.host, command.port, command.allowedHosts);
    });

program
    .command("exec [function-name]")
    .description("Executes the extension on the sample data")
    .option("--no-build", "Use existing build to run")
    .option("--defaults <default-options>", `Default values for the extension options (e.g, flag=false,prefix=\\"pre\\")`)
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

program.parse(process.argv);