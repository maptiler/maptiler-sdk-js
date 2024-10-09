import type { ResourceType } from "maplibre-gl";

/**
 * Entry for a request
 */
export type RequestRecord = {
  /**
   * URL, absolute or relative
   */
  url: string;

  /**
   * Code for the type of resource
   */
  resourceType?: ResourceType;

  /**
   * Timestamps (ms) just before perfoaming the request
   */
  timestamp: [number];
};

/**
 * Logs all the request (http and custom protocols) with resource types.
 * Essentially a JS Map object.
 */
class RequestLogger {
  private records = new Map<string, RequestRecord>();

  /**
   * Add a record. The unique key is the URL. If URL already exists,
   * a new timestamp is added to the array for the already existing record.
   */
  add(url: string, resourceType?: ResourceType) {
    if (this.records.has(url)) {
      const record = this.records.get(url);
      record?.timestamp.push(+new Date());
    } else {
      this.records.set(url, {
        url,
        resourceType,
        timestamp: [+new Date()],
      } as RequestRecord);
    }
  }

  /**
   * Gets a record or `null`.
   */
  get(url: string): RequestRecord | null {
    if (this.records.has(url)) {
      return this.records.get(url) as RequestRecord;
    }
    return null;
  }
}

let requestLogger: RequestLogger | null = null;

/**
 * Get a singleton RequetLogger instance
 */
export function getRequestlogger(): RequestLogger {
  if (!requestLogger) {
    requestLogger = new RequestLogger();
  }
  return requestLogger;
}
