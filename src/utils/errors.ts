export class FetchError extends Error {
  status: number;
  statusText: string;

  constructor(response: Response, resource: string, module: string) {
    const message = `[${module}]: Failed to fetch ${resource} at ${response.url}: ${response.status.toString()}: ${response.statusText}`;

    super(message);

    this.name = "FetchError";
    this.message = message;
    this.status = response.status;
    this.statusText = response.statusText;
  }
}
