/** Options for generating a Phin client */
export type RequesterOptions = {
  /** The GraphQL endpoint URL */
  url: string;
  /** Additional headers to pass with the request */
  headers?: {
    [header: string]: string;
  };
  /** The Taskless App ID */
  appId: string;
  /** The Taskless App Secret */
  secret: string;
  /** The number of HTTP retries to make when doing GraphQL operations */
  retries?: number;
};

/** A simplified GraphQL response */
export type GraphQLResponse = {
  data?: unknown;
  errors?: unknown;
};

/** A stand-in error object that works with Phin */
export class RequestError extends Error {
  raw: unknown;
  constructor(err: string | undefined, raw: unknown) {
    super(err);
    this.raw = raw;
  }
}
