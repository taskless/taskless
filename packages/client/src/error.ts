import { type OutgoingHttpHeaders } from "node:http";

type JobErrorOptions = {
  retryAfter?: string | number;
};

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
