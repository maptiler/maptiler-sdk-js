export default class ServiceError extends Error {
  constructor(private res: Response) {
    super(`Call to enpoint ${res.url} failed with the status code ${res.status}`)

  }
}