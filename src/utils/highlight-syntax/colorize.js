const chalk = require("chalk");

function lightTheme(type) {
    switch (type) {
        case "comment":
        case "prolog":
        case "doctype":
        case "cdata":
            return [112, 128, 144];
        case "punctuation":
            return [153, 153, 153];
        case "property":
        case "tag":
        case "boolean":
        case "number":
        case "constant":
        case "symbol":
        case "deleted":
            return [153, 0, 85];
        case "selector":
        case "attr-name":
        case "string":
        case "char":
        case "builtin":
        case "inserted":
            return [102, 153, 0];
        case "operator":
        case "entity":
        case "url":
            return [166, 127, 89];
        case "atrule":
        case "attr-value":
        case "keyword":
            return [0, 119, 170];
        case "function":
            return [221, 74, 104];
        case "regex":
        case "important":
        case "variable":
            return [238, 153, 0];
    }
}

function darkTheme(type) {
    switch (type) {
        case "comment":
        case "prolog":
        case "doctype":
        case "cdata":
            return [153, 127, 102];
        case "punctuation":
            return [153, 153, 153];
        case "property":
        case "tag":
        case "boolean":
        case "number":
        case "constant":
        case "symbol":
            return [209, 147, 158];
        case "selector":
        case "attr-name":
        case "string":
        case "char":
        case "builtin":
        case "inserted":
            return [188, 224, 81];
        case "operator":
        case "entity":
        case "url":
            return [244, 183, 61];
        case "atrule":
        case "attr-value":
        case "keyword":
            return [209, 147, 158];
        case "function":
            return [221, 74, 104];
        case "regex":
        case "important":
        case "variable":
            return [238, 153, 0];
        case "deleted":
            return [255, 0, 0];
    }
}

function tokenColor(type, light) {
    const theme = light ? lightTheme : darkTheme;

    return theme(type);
}

module.exports = function colorize(token, type, light = false) {
    const color = tokenColor(type, light);

    if (!color) {
        return token;
    }

    return chalk.rgb(...color)(token);
};