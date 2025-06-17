#!/usr/bin/env node
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import updateNotifier from "update-notifier";
import { Command } from "commander";
import { resolveBuildPath } from "./utils/paths.js";
import build from "./commands/build.js";
import start from "./commands/start.js";
import exec from "./commands/exec.js";
import publish from "./commands/publish/index.js";
import create from "./commands/create.js";
import test from "./commands/test.js";
import execWebpackConfig from "./config/webpack.exec.mjs";
import prodWebpackConfig from "./config/webpack.prod.mjs";
import devWebpackConfig from "./config/webpack.dev.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { name, version } = fs.readJsonSync(`${__dirname}/../package.json`)

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

const program = new Command(name).version(version);
const TEST_ARGS_INDEX = 3;

program
    .command("create <dir>")
    .description("Create empty Zeplin extension at directory.")
    .option("-y --yes", "Create extension without prompt for configuration")
    .action((extensionDir, { yes }) => {
        const root = path.resolve(process.cwd(), extensionDir);

        return create({ root, disablePrompt: yes });
    });

program
    .command("build")
    .description("Create build, targeting production environment.")
    .option("-d --dev", "Target development environment")
    .action(async options => {
        await build(options.dev ? devWebpackConfig : prodWebpackConfig);
    });

program
    .command("clean")
    .description("Clean build directory.")
    .action(() => {
        fs.removeSync(resolveBuildPath());
    });

program
    .command("start")
    .description("Start local server, serving the extension.")
    .option("-h --host <host>", "Host name (Default: \"127.0.0.1\")")
    .option("-p --port <port>", "Port (Default: 7070)")
    .option("-a --allowed-hosts <allowed-hosts>", "Allowed hosts, comma-separated (e.g., localhost,127.0.0.1,example.com,*.example.com) (Default: \"all\")")
    .action(async command => {
        await start(command.host, command.port, command.allowedHosts);
    });

program
    .command("exec [function-name]")
    .description("Execute extension function with sample data.")
    .option("--no-build", "Use existing build.")
    .option("--defaults <default-options>", `Set default extension option values (e.g, flag=false,prefix=\\"pre\\")`)
    .action((fnName, options) => {
        let defaultOptions;

        if (options.defaults) {
            defaultOptions = {};

            options.defaults.split(",").forEach(keyValue => {
                const [key, value] = keyValue.split("=");

                defaultOptions[key] = JSON.parse(value);
            });
        }

        exec(execWebpackConfig, fnName, defaultOptions, options.build);
    });

program
    .command("publish")
    .description(`Publish extension, submitting it for review to be listed on ${chalk.underline("https://extensions.zeplin.io.")}`)
    .option("--path <build-path>", `Path for the extension build to be published`)
    .option("--verbose", "Enables verbose logs")
    .action(async ({ path: buildPath, verbose }) => {
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
    .action(async () => {
        await test(process.argv.slice(TEST_ARGS_INDEX));
    });

program.on("command:*", () => {
    program.outputHelp();
});

beforeCommand();
program.parse(process.argv);
