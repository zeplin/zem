const Ajv = require("ajv");
const ajv = new Ajv({ allErrors: true });

const pickerOptionSchema = {
    type: "object",
    required: ["name", "value"],
    properties: {
        name: { type: "string" },
        value: { type: "string" }
    }
};

const pickerSchema = {
    type: "object",
    required: ["name", "type", "id", "default"],
    properties: {
        name: { type: "string" },
        type: { const: "picker" },
        id: { type: "string" },
        default: { type: "string" },
        options: { type: "array", items: pickerOptionSchema }
    }
};

const switchSchema = {
    type: "object",
    required: ["name", "type", "id", "default"],
    properties: {
        name: { type: "string" },
        type: { const: "switch" },
        id: { type: "string" },
        default: { type: "boolean" }
    }
};

const textOptionSchema = {
    type: "object",
    required: ["name", "type", "id", "default"],
    properties: {
        name: { type: "string" },
        type: { const: "text" },
        id: { type: "string" },
        default: { type: "string" }
    }
};

const optionsSchema = {
    type: "array",
    items: {
        anyOf: [
            pickerSchema,
            switchSchema,
            textOptionSchema
        ]
    }
};

const urlPattern = "^(https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|www\\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\.[^\\s]{2,}|https?:\\/\\/(?:www\\.|(?!www))[a-zA-Z0-9]+\\.[^\\s]{2,}|www\\.[a-zA-Z0-9]+\\.[^\\s]{2,})$";

const manifestSchema = {
    type: "object",
    required: ["packageName", "name", "description", "version", "moduleURL", "platforms"],
    properties: {
        packageName: { type: "string" },
        name: { type: "string" },
        description: { type: "string" },
        version: { type: "string", pattern: "(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)" },
        moduleURL: { type: "string" },
        readmeURL: { type: "string" },
        author: {
            type: "object",
            properties: {
                name: { type: "string" },
                email: { type: "string", format: "email" },
                url: { type: "string", pattern: urlPattern }
            }
        },
        platforms: {
            type: "array",
            items: {
                enum: ["web", "android", "ios", "osx"]
            },
            uniqueItems: true,
            minItems: 1
        },
        options: optionsSchema
    }
};

const validate = ajv.compile(manifestSchema);

module.exports = function (manifestObj) {
    const valid = validate(manifestObj);

    if (!valid) {
        return {
            valid,
            errors: ajv.errorsText(validate.errors, { dataVar: "manifest", separator: "\n" })
        };
    }

    return { valid };
};
