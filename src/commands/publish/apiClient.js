const { URL } = require("url");
const { BAD_REQUEST, INTERNAL_SERVER_ERROR, MOVED_TEMPORARILY } = require("http-status-codes");
const request = require("request-promise-native");

const { apiBaseUrl, apiClientId } = require("../../config/constants");
const { ClientError, ServerError } = require("../../errors");

function createError(response) {
    const { statusCode, body, headers } = response;
    const extra = {
        response: {
            statusCode,
            body,
            headers
        }
    };

    if (statusCode >= BAD_REQUEST && statusCode < INTERNAL_SERVER_ERROR) {
        const { message, title } = body;

        return new ClientError(statusCode, `${title}${message ? `: ${message}` : ""}`, extra);
    }

    if (statusCode >= INTERNAL_SERVER_ERROR) {
        return new ServerError(statusCode, extra);
    }

    return new Error("Zeplin API error");
}

module.exports = class ApiClient {
    constructor() {
        this.requestor = request.defaults({
            baseUrl: apiBaseUrl,
            simple: false,
            resolveWithFullResponse: true,
            json: true
        });
    }

    async request(opts) {
        const response = await this.requestor(opts);
        const { body } = response;

        if (response.statusCode >= BAD_REQUEST) {
            throw createError(response);
        }

        return body;
    }

    async login({ handle, password }) {
        const { token } = await this.request({
            method: "POST",
            uri: "/users/login",
            body: {
                handle,
                password
            }
        });

        return token;
    }

    async generateAuthToken(loginToken) {
        const response = await this.requestor({
            method: "GET",
            uri: "/oauth/authorize",
            qs: {
                client_id: apiClientId,
                response_type: "token",
                scope: "write"
            },
            headers: { "Zeplin-Token": loginToken },
            followRedirect: false
        });

        const { headers: { location }, statusCode } = response;

        if (statusCode !== MOVED_TEMPORARILY) {
            throw createError(response);
        }

        const { searchParams } = new URL(location);

        return searchParams.get("access_token");
    }

    getExtensions({ authToken, owner }) {
        return this.request({
            method: "GET",
            uri: `/extensions`,
            qs: {
                owner
            },
            headers: { "Zeplin-Access-Token": authToken }
        });
    }

    createExtension({ authToken, data }) {
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
            },
            headers: { "Zeplin-Access-Token": authToken }
        });
    }

    createExtensionVersion({ authToken, extensionId, version, packageBuffer }) {
        return this.request({
            method: "POST",
            uri: `/extensions/${extensionId}/versions`,
            formData: {
                version,
                package: {
                    options: {
                        filename: "package.zip"
                    },
                    value: packageBuffer
                }
            },
            headers: { "Zeplin-Access-Token": authToken }
        });
    }
};
