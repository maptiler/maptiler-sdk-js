/**
 * A ServiceError is an Error that includes the HTTP response details
 */
export class ServiceError extends Error {
  constructor(public res: Response, customMessage = "") {
    super(
      `Call to enpoint ${res.url} failed with the status code ${res.status}. ${customMessage}`
    );
  }
}
