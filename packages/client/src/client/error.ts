import { OutgoingHttpHeaders } from "http";

/** A stand-in error object that works with Phin */
export class RequestError extends Error {
  raw: unknown;
  constructor(err: string | undefined, raw: unknown) {
    super(err);
    this.raw = raw;
  }
}

export class ResponseError extends Error {
  statusCode?: number;
  statusMessage?: string;
  headers?: OutgoingHttpHeaders;
}

type JobErrorOptions = {
  retryAfter?: string | number;
};

export class JobError extends ResponseError {
  statusCode: number;
  statusMessage: string;
  headers: OutgoingHttpHeaders;

  constructor(message: string, options?: JobErrorOptions) {
    super(message);
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
