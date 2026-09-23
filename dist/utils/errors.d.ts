export declare class FetchError extends Error {
    status: number;
    statusText: string;
    constructor(response: Response, resource: string, module: string);
}
