import { isCI } from "ci-info";

export const constants = {
    defaultHostName: "localhost",
    defaultPort: 7070,
    buildDirName: "build",
    bundleName: "main",
    isCI,
    accessToken: process.env.ZEM_ACCESS_TOKEN,
    apiBaseUrl: process.env.API_BASE_URL || "https://api.zeplin.io",
    apiClientId: process.env.API_CLIENT_ID || "5bbc983af6c410493afb03f1"
};