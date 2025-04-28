const fs = require("fs-extra");
const jwt = require("jsonwebtoken");
const prompts = require("prompts");

const paths = require("../../utils/paths");
const { accessToken, isCI } = require("../../config/constants");
const apiClient = require("./apiClient");

const EXIT_CODE_FOR_SIGTERM = 130;

function readToken() {
    const rcFilePath = paths.getRcFilePath();

    if (fs.existsSync(rcFilePath)) {
        const rcFile = JSON.parse(fs.readFileSync(rcFilePath, "utf-8"));

        return rcFile.token;
    }
}

function updateRCFile(token) {
    const rcFilePath = paths.getRcFilePath();
    const rcContent = fs.existsSync(rcFilePath) ? JSON.parse(fs.readFileSync(rcFilePath, "utf-8")) : {};

    rcContent.token = token;
    fs.writeFileSync(rcFilePath, JSON.stringify(rcContent));
}

function getAuthInfo(authToken) {
    if (!authToken) {
        throw new Error("Authentication token is not provided");
    }

    const { aud } = jwt.decode(authToken, { complete: false });
    if (!aud) {
        throw new Error("Invalid authentication token");
    }

    const [, userId] = aud.split(":");
    if (!userId) {
        throw new Error("Invalid authentication token");
    }

    return {
        authToken,
        userId
    };
}

module.exports = class AuthenticationService {
    authenticate() {
        if (isCI || accessToken) {
            return getAuthInfo(accessToken);
        }

        const tokenFromFile = readToken();
        if (tokenFromFile) {
            return getAuthInfo(tokenFromFile);
        }
        return this.login();
    }

    async login() {
        const { handle, password } = await prompts([
            {
                type: "text",
                name: "handle",
                message: "Username or email address: ",
                validate: value => Boolean(value && value.length) || "Username or email address must not be empty"
            },
            {
                type: "password",
                name: "password",
                message: "Password",
                validate: value => Boolean(value && value.length) || "Password must not be empty"
            }
        ]);

        if (!password) {
            process.exit(EXIT_CODE_FOR_SIGTERM);
        }

        const token = await apiClient.login({ handle, password });
        const authToken = await apiClient.generateAuthToken(token);

        const authInfo = getAuthInfo(authToken);

        await updateRCFile(authToken);

        return authInfo;
    }
};
