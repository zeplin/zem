export class ClientError extends Error {
    constructor(status, extra, msg) {
        const message = `${msg || "Client error"}`;
        super(message);

        Error.captureStackTrace(this, this.constructor);

        this.status = status;
        this.message = message;
        this.name = "ClientError";
        this.extra = extra;
    }
};
