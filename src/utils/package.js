import fs from "fs-extra";
import * as paths from "./paths.js";

export const getPackageJson = () => {
    const packageJsonFile = paths.resolveExtensionPath("./package.json");
    if (fs.existsSync(packageJsonFile)) {
        return fs.readJSONSync(packageJsonFile);
    }
};

export const getPackageVersion = () => {
    const packageJson = getPackageJson();
    if (packageJson) {
        return packageJson.version;
    }

    return undefined;
};