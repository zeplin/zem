import { URL } from "node:url";
import { StatusCodes } from "http-status-codes";
import { FormData, request as undiciRequest } from "undici";
import qs from "qs";
import { constants } from "../../config/constants.js";
import { ClientError, ServerError } from "../../errors/index.js";

const { apiBaseUrl, apiClientId } = constants;

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

    let errorMessage;
    if (headers["content-type"].startsWith("application/json")) {
        const { message, title } = JSON.parse(extra.response.body);
        errorMessage = `${title}${message ? `: ${message}` : ""}`;
    }

    if (statusCode >= StatusCodes.BAD_REQUEST && statusCode < StatusCodes.INTERNAL_SERVER_ERROR) {
        return new ClientError(statusCode, extra, errorMessage);
    }

    if (statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) {
        return new ServerError(statusCode, extra, errorMessage);
    }

    return new Error("Zeplin API error");
}

function getUrl(path) {
    return `${apiBaseUrl}${path}`;
}

async function request(path, opts) {
    const response = await undiciRequest(getUrl(path), opts);

    if (response.statusCode >= StatusCodes.BAD_REQUEST) {
        throw await createError(response);
    }

    const body = response.headers["content-type"].startsWith("application/json")
        ? await response.body.json()
        : await response.body.text();

    return {
        body,
        statusCode: response.statusCode,
        headers: response.headers
    };
}


export const login = async ({ handle, password }) => {
    const { body: { token } } = await request("/users/login", {
        method: "POST",
        body: JSON.stringify({
            handle,
            password
        }),
        headers: { "Content-Type": "application/json" }
    });

    return token;
};

export const generateAuthToken = async loginToken => {
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

    if (statusCode !== StatusCodes.MOVED_TEMPORARILY) {
        throw await createError(response);
    }

    const { searchParams } = new URL(location);

    return searchParams.get("access_token");
};

export const getExtensions = async ({ authToken, owner }) => {
    const queryString = qs.stringify({ owner });
    const { body: { extensions } } = await request(`/extensions?${queryString}`, {
        method: "GET",
        headers: { "Zeplin-Access-Token": authToken }
    });

    return extensions;
};

export const createExtension = ({ authToken, data }) => {
    const {
        packageName,
        name,
        description,
        platforms,
        version,
        packageBuffer
    } = data;


    const formData = new FormData();
    formData.set("version", version);
    formData.set("packageName", packageName);
    formData.set("name", name);
    formData.set("description", description);
    formData.set("projectTypes", platforms);
    formData.set("package", new Blob([packageBuffer], { type: "application/zip" }), "package.zip");

    return request("/extensions", {
        method: "POST",
        body: formData,
        headers: {
            "Zeplin-Access-Token": authToken
        }
    });
};

export const createExtensionVersion = ({ authToken, extensionId, version, packageBuffer }) => {
    const formData = new FormData();
    formData.set("version", version);
    formData.set("package", new Blob([packageBuffer], { type: "application/zip" }), "package.zip");

    return request(`/extensions/${extensionId}/versions`, {
        method: "POST",
        body: formData,
        headers: {
            "Zeplin-Access-Token": authToken
        }
    });
};
