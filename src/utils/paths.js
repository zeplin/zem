const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildDirName } = require("../config/constants");

const extensionRoot = fs.realpathSync(process.cwd());

function resolveExtensionPath(relativePath = "") {
    return path.resolve(extensionRoot, relativePath);
}

function resolveBuildPath(relativePath = "") {
    return path.resolve(extensionRoot, buildDirName, relativePath);
}

function getRcFilePath() {
    return path.resolve(os.homedir(), ".zemrc");
}

module.exports = {
    getRcFilePath,
    resolveExtensionPath,
    resolveBuildPath
};