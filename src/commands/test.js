import { spawn } from "node:child_process";
import { readConfig } from "jest-config";
import { getPackageJson } from "../utils/package.js";

async function getJestConfig(cwd = process.cwd()) {
    try {
        const { config, configPath } = await readConfig({}, cwd);
        return { config, configPath };
    } catch (error) {
        console.log(`Could not found jest config: ${error.message}`);
        return false;
    }
}

export default async function (args) {
    const packageJson = getPackageJson();
    let nodeOptions = process.env.NODE_OPTIONS;
    if (packageJson && packageJson.type === "module") {
        nodeOptions = `${nodeOptions ? `${nodeOptions} ` : ""}--experimental-vm-modules`;
    }

    const configFile = (await getJestConfig()).configPath;

    const subprocess = spawn("node", [
        "node_modules/jest/bin/jest.js",
        "--config",
        configFile,
        ...args
    ], {
        env: {
            ...process.env,
            NODE_OPTIONS: nodeOptions
        },
        stdio: "inherit"
    });

    return new Promise((resolve, reject) => {
        subprocess.on("close", (code) => {
            if (code === 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        });

        subprocess.on("error", (err) => {
            reject(err);
        });
    });
};
