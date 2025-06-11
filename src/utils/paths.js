import fs from "fs-extra";
import os from "os";
import path from "path";
import { constants } from "../config/constants.js";

const extensionRoot = fs.realpathSync(process.cwd());

export function resolveExtensionPath(relativePath = "") {
    return path.resolve(extensionRoot, relativePath);
}

export function resolveBuildPath(relativePath = "") {
    return path.resolve(extensionRoot, constants.buildDirName, relativePath);
}

export function getRcFilePath() {
    return path.resolve(os.homedir(), ".zemrc");
}
