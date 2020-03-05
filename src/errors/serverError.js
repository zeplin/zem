module.exports = class ServerError extends Error {
    constructor(status, extra) {
        const message = `(${status}) Server error`;
        super(message);

        Error.captureStackTrace(this, this.constructor);

        this.status = status;
        this.message = message;
        this.name = "ServerError";
        this.extra = extra;
    }
};