import { type OutgoingHttpHeaders } from "node:http";

/**
 * A set of options unique to Job Errors
 */
type JobErrorOptions = {
  /**
   * Either a UTC date such as `Wed, 21 Oct 2015 07:28:00 GMT` or a number of
   * seconds such as `100` which will control how long Taskless.io should wait
   * before retrying a request. Setting this value automatically will change
   * an error's status code to `503`.
   */
  retryAfter?: string | number;
};

/**
 * A base class describing a Response Error inside of a Job Handler
 */
class ResponseError extends Error {
  statusCode?: number;
  statusMessage?: string;
  headers?: OutgoingHttpHeaders;
  type: string;
  constructor(message: string) {
    super(message);
    this.type = "ResponseError";
  }
}

/**
 * Describes an error generated during the running of a Taskless Job Handler.
 * Using JobError instead of a default Error enables the capture of status
 * codes, headers, and the ability to set a `503` retry in order to manually
 * control the backoff from the Taskless.io service.
 */
export class JobError extends ResponseError {
  statusCode: number;
  statusMessage: string;
  headers: OutgoingHttpHeaders;

  constructor(message: string, options?: JobErrorOptions) {
    super(message);
    this.type = "JobError";
    this.statusCode = 500;
    this.statusMessage = "Internal Server Error";
    this.headers = {};
    if (typeof options?.retryAfter !== "undefined") {
      this.headers["retry-after"] = options.retryAfter;
      this.statusCode = 503;
      this.statusMessage = "Unavailable";
    }
  }
}
