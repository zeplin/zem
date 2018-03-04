const fs = require("fs");
const { resolveExtensionPath } = require("../paths");

module.exports = function (content, filename) {
    const obj = JSON.parse(content);
    const {
        name,
        version,
        description,
        author,
        repository
    } = require(resolveExtensionPath("package.json"));

    Object.assign(obj, {
        name,
        version,
        author,
        description,
        repository,
        moduleURL: `./${filename}`
    });

    if (fs.existsSync(resolveExtensionPath("README.md"))) {
        obj.readmeURL = `./README.md`;
    }

    return JSON.stringify(obj, null, 2);
};