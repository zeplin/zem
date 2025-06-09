import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser
            },
            ecmaVersion: 2017,
            sourceType: "module"
        },
        ignores: ["eslint.config.mjs"],
        rules: {
            "no-console": "error"
        }
    }]);
