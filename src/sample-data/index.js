import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const project = fs.readJSONSync(`${__dirname}/project.json`);
const componentVariants = fs.readJSONSync(`${__dirname}/componentVariants.json`);
const components = fs.readJSONSync(`${__dirname}/components.json`);
const screens = fs.readJSONSync(`${__dirname}/screens.json`);
const version = fs.readJSONSync(`${__dirname}/version.json`);

export default {
    componentVariants,
    components,
    project,
    screens,
    screenVersion: version
};