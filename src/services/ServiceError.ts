/**
 * A ServiceError is an Error that includes the HTTP response details
 */
export default class ServiceError extends Error {
  constructor(public res: Response, customMessage: string = '') {
    super(`Call to enpoint ${res.url} failed with the status code ${res.status}. ${customMessage}`)
  }
}