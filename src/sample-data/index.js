const project = require("./project.json");
const version = require("./version.json");
const screens = require("./screens.json");
const components = require("./components.json");
const componentVariants = require("./componentVariants.json");

module.exports = {
    componentVariants,
    components,
    project,
    screens,
    screenVersion: version
};