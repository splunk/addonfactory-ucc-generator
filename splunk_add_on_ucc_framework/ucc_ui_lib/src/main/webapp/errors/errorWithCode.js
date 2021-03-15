export class ErrorWithCode extends Error {
    constructor(error, errorCode) {
        super(error.message);
        this.originalError = error;
        this.errorCode = errorCode;
    }
}
