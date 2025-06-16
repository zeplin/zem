import path from "node:path";
import fs from "fs-extra";

export function findESLintConfig(cwd = process.cwd()) {
    const configFiles = [
        "eslint.config.js",
        "eslint.config.mjs",
        "eslint.config.cjs",
        "eslint.config.ts",
        "eslint.config.mts",
        "eslint.config.cts",
        ".eslintrc.js",
        ".eslintrc.cjs",
        ".eslintrc.yaml",
        ".eslintrc.yml",
        ".eslintrc.json",
        ".eslintrc",        // Legacy format (usually JSON/YAML)
        "package.json"
    ];

    for (const file of configFiles) {
        const fullPath = path.join(cwd, file);
        if (fs.existsSync(fullPath)) {
            if (file === "package.json") {
                const pkg = fs.readJSONSync(fullPath, "utf8");
                if (pkg.eslintConfig) {
                    return pkg.eslintConfig;
                }
            } else {
                return fullPath;
            }
        }
    }

    return null;
}
