const Prism = require("prismjs");
const colorize = require("./colorize");

function flattenToken(token, type = "literal") {
    if (typeof token === "string") {
        return {
            token,
            type
        };
    }

    if (typeof token.content === "string") {
        return {
            token: token.content,
            type: token.type
        };
    }

    return [].concat(...token.content.map(
        tk => flattenToken(tk, token.type)
    ));
}

function groupTokensByLine(tokens) {
    let group = [];
    const groups = [group];

    for (const token of tokens) {
        if (typeof token === "string" && token.includes("\n")) {
            const lines = token.split("\n");

            group.push(lines[0]);

            for (let i = 1; i < lines.length - 1; i++) {
                groups.push([lines[i]]);
            }

            group = [lines[lines.length - 1]];
            groups.push(group);
        } else {
            group.push(token);
        }
    }

    return groups;
}

function tokenize(code, lang) {
    const tokens = Prism.tokenize(code, Prism.languages[lang]);

    return [].concat(...tokens.map(flattenToken));
}

function isSupported(language) {
    return !!Prism.languages[language];
}

module.exports = function (code, language, customMapping = {}) {
    if (!isSupported(language)) {
        return code;
    }

    return groupTokensByLine(tokenize(code, language)).map(line =>
        line.map(({ token, type }) => colorize(token, type)).join("")
    ).join("\n");
};