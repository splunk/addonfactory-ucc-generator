export class ResponseError extends Error {
    response: Response;

    constructor(params: { response: Response; message: string }) {
        super(params.message);
        this.response = params.response;
    }
}
