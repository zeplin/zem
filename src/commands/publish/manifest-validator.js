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

// Credit to Diego Perini https://gist.github.com/dperini/729294
const urlPattern = "^" +
    // Protocol identifier (optional)
    // Short syntax // still required
    "(?:(?:(?:https?|ftp):)?\\/\\/)" +
    // User:pass BasicAuth (optional)
    "(?:\\S+(?::\\S*)?@)?" +
    "(?:" +
    // IP address exclusion
    // Private & local networks
    "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
    "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
    "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
    // IP address dotted notation octets
    // Excludes loopback network 0.0.0.0
    // Excludes reserved space >= 224.0.0.0
    // Excludes network & broadcast addresses
    // (first & last IP address of each class)
    "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
    "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
    "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
    "|" +
    // Host & domain names, may end with dot
    // Can be replaced by a shortest alternative
    // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
    "(?:" +
    "(?:" +
    "[a-z0-9\\u00a1-\\uffff]" +
    "[a-z0-9\\u00a1-\\uffff_-]{0,62}" +
    ")?" +
    "[a-z0-9\\u00a1-\\uffff]\\." +
    ")+" +
    // TLD identifier name, may end with dot
    "(?:[a-z\\u00a1-\\uffff]{2,}\\.?)" +
    ")" +
    // Port number (optional)
    "(?::\\d{2,5})?" +
    // Resource path (optional)
    "(?:[/?#]\\S*)?" +
    "$";

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
