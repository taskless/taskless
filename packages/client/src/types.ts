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
