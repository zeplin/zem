import globals from "globals";
import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import zeplinEslintConfig from "@zeplin/eslint-config/node.js";

export default defineConfig([
    js.configs.recommended,
    {
        plugins: {
            zeplin: zeplinEslintConfig
        },
        rules: {
            "no-process-exit": "off",
            "no-sync": "off",
            "class-methods-use-this": "off",
            "no-unused-vars": ["error", { "caughtErrors": "none" }]
        }
    },
    { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
    { files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node } },
    { ignores: ["src/template/*"] },
]);