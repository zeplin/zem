const fs = require("fs");
const path = require("path");
const { buildDirName } = require("../config/constants");

const extensionRoot = fs.realpathSync(process.cwd());

function resolveExtensionPath(relativePath = "") {
    return path.resolve(extensionRoot, relativePath);
}

function resolveBuildPath(relativePath = "") {
    return path.resolve(extensionRoot, buildDirName, relativePath);
}

module.exports = {
    resolveExtensionPath,
    resolveBuildPath
};