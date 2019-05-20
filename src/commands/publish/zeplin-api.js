const fs = require("fs-extra");
const jwt = require("jsonwebtoken");
const request = require("request-promise-native");
const paths = require("../../utils/paths");

const HEADER_API_TOKEN = "Zeplin-Access-Token";
const REQUEST_DEFAULT_OPTS = {
    baseUrl: "https://api.zeplin.io",
    simple: false,
    resolveWithFullResponse: true,
    json: true
};

const AUTH_URL = "https://extensions.zeplin.io/authorize";

class ClientError extends Error {
    constructor(status, msg, extra) {
        const message = `${msg || "Client error"}`;
        super(message);

        Error.captureStackTrace(this, this.constructor);

        this.status = status;
        this.message = message;
        this.name = "ClientError";
        this.extra = extra;
    }
}

class ServerError extends Error {
    constructor(status, extra) {
        const message = `(${status}) Server error`;
        super(message);

        Error.captureStackTrace(this, this.constructor);

        this.status = status;
        this.message = message;
        this.name = "ServerError";
        this.extra = extra;
    }
}

function createError(response) {
    const { statusCode, body } = response;
    const extra = { response: response.toJSON() };

    if (statusCode >= 400 && statusCode < 500) {
        const { message, title } = body;

        return new ClientError(statusCode, `${title}${message ? `: ${message}` : ""}`, extra);
    }

    if (statusCode >= 500 && statusCode < 600) {
        return new ServerError(statusCode, extra);
    }

    return new Error("Zeplin API error");
}

function readToken() {
    const rcFilePath = paths.getRcFilePath();

    if (fs.existsSync(rcFilePath)) {
        const rcFile = JSON.parse(fs.readFileSync(rcFilePath));

        return rcFile.token;
    }

    return null;
}

function saveToken(token) {
    const rcFilePath = paths.getRcFilePath();
    let rcContent = {};

    if (fs.existsSync(rcFilePath)) {
        rcContent = JSON.parse(fs.readFileSync(rcFilePath));
    }

    rcContent.token = token;
    fs.writeFileSync(rcFilePath, JSON.stringify(rcContent));
}

function removeToken() {
    const rcFilePath = paths.getRcFilePath();

    let rcFile = {};
    if (fs.existsSync(rcFilePath)) {
        rcFile = JSON.parse(fs.readFileSync(rcFilePath));

        delete rcFile.token;
    }

    fs.writeFileSync(rcFilePath, JSON.stringify(rcFile));
}

/* eslint-disable class-methods-use-this */
class API {
    constructor() {
        this.requestor = request.defaults(REQUEST_DEFAULT_OPTS);
    }

    hasToken() {
        return !!readToken();
    }

    setToken(token) {
        const { aud } = jwt.decode(token, { complete: false });

        if (!aud) {
            throw new Error("Invalid token");
        }

        const [, userId] = aud.split(":");

        if (!userId) {
            throw new Error("Invalid token");
        }

        this.userId = userId;
        this.token = token;

        saveToken(token);
    }

    removeToken() {
        removeToken();

        this.token = null;
        this.userId = null;
    }

    async request(opts, fullResponse = false) {
        let reqOpts = opts;

        if (reqOpts.noToken) {
            reqOpts = Object.assign({}, opts);

            delete reqOpts.noToken;
            delete reqOpts[HEADER_API_TOKEN];
        } else if (this.token) {
            const headers = reqOpts.headers || {};

            headers[HEADER_API_TOKEN] = this.token;

            Object.assign(reqOpts, { headers });
        }

        const response = await this.requestor(reqOpts);
        const { body, statusCode } = response;

        if (response.statusCode >= 400) {
            if (response.statusCode === 401) {
                this.removeToken();
            }

            throw createError(response);
        }

        return fullResponse ? {
            body,
            statusCode
        } : body;
    }

    async auth({ handle, password } = {}) {
        if (handle && password) {
            try {
                const options = Object.assign({}, REQUEST_DEFAULT_OPTS, {
                    body: {
                        scope: ["write"],
                        username: handle,
                        password
                    }
                });

                delete options.baseUrl;

                const response = await request.post(AUTH_URL, options);
                const { body, statusCode } = response;

                if (statusCode >= 400) {
                    throw createError(response);
                }

                const { access_token: token } = body;

                if (!token) {
                    throw new Error("Authentication failed!");
                }

                return this.setToken(token);
            } catch (err) {
                throw err;
            }
        }

        try {
            const token = readToken();

            this.setToken(token);
        } catch (err) {
            this.removeToken();

            throw err;
        }
    }

    getExtensions() {
        return this.request({
            method: "GET",
            uri: `/extensions?owner=${this.userId}`
        });
    }

    createExtension(data) {
        const {
            packageName,
            name,
            description,
            platforms,
            version,
            packageBuffer
        } = data;

        return this.request({
            method: "POST",
            uri: "/extensions",
            formData: {
                version,
                packageName,
                name,
                description,
                projectTypes: platforms,
                package: {
                    options: {
                        filename: "package.zip"
                    },
                    value: packageBuffer
                }
            }
        });
    }

    createExtensionVersion(eid, version, packageBuffer) {
        return this.request({
            method: "POST",
            uri: `/extensions/${eid}/versions`,
            formData: {
                version,
                package: {
                    options: {
                        filename: "package.zip"
                    },
                    value: packageBuffer
                }
            }
        });
    }
}

module.exports = new API();
