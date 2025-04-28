const { URL } = require("url");
const { BAD_REQUEST, INTERNAL_SERVER_ERROR, MOVED_TEMPORARILY } = require("http-status-codes");
const undici = require("undici");
const qs = require("qs");

const { apiBaseUrl, apiClientId } = require("../../config/constants");
const { ClientError, ServerError } = require("../../errors");

async function createError(response) {
    const { statusCode, body, headers } = response;
    const responseBody = await body.text();
    const extra = {
        response: {
            statusCode,
            body: responseBody,
            headers
        }
    };

    if (statusCode >= BAD_REQUEST && statusCode < INTERNAL_SERVER_ERROR) {
        const { message, title } = JSON.parse(responseBody);

        return new ClientError(statusCode, `${title}${message ? `: ${message}` : ""}`, extra);
    }

    if (statusCode >= INTERNAL_SERVER_ERROR) {
        return new ServerError(statusCode, extra);
    }

    return new Error("Zeplin API error");
}

function getUrl(path) {
    return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request(path, opts) {
    const response = await undici.request(getUrl(path), opts);

    if (response.statusCode >= BAD_REQUEST) {
        throw await createError(response);
    }

    return {
        body: await response.body.json(),
        statusCode: response.statusCode,
        headers: response.headers
    };
}

module.exports = {
    login: async ({ handle, password }) => {
        const { body: { token } } = await request("/users/login", {
            method: "POST",
            body: JSON.stringify({
                handle,
                password
            }),
            headers: { "Content-Type": "application/json" }
        });

        return token;
    },
    generateAuthToken: async loginToken => {
        const queryString = qs.stringify({
            client_id: apiClientId,
            response_type: "token",
            scope: "write"
        });
        const response = await request(`/oauth/authorize?${queryString}`, {
            method: "GET",
            headers: {
                "Zeplin-Token": loginToken
            },
            maxRedirections: 0
        });

        const { headers: { location }, statusCode } = response;

        if (statusCode !== MOVED_TEMPORARILY) {
            throw await createError(response);
        }

        const { searchParams } = new URL(location);

        return searchParams.get("access_token");
    },
    getExtensions: ({ authToken, owner }) => {
        const queryString = qs.stringify({ owner });
        return request(`/extensions${queryString}`, {
            method: "GET",
            headers: { "Zeplin-Access-Token": authToken }
        });
    },
    createExtension: ({ authToken, data }) => {
        const {
            packageName,
            name,
            description,
            platforms,
            version,
            packageBuffer
        } = data;

        const formData = qs.stringify({
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
        });
        return request("/extensions", {
            method: "POST",
            body: formData,
            headers: {
                "Zeplin-Access-Token": authToken,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    },
    createExtensionVersion: ({ authToken, extensionId, version, packageBuffer }) => {
        const formData = qs.stringify({
            version,
            package: {
                options: {
                    filename: "package.zip"
                },
                value: packageBuffer
            }
        });
        return request(`/extensions/${extensionId}/versions`, {
            method: "POST",
            body: formData,
            headers: {
                "Zeplin-Access-Token": authToken,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }
};
