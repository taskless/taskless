/* eslint-disable @typescript-eslint/no-explicit-any */
// core typings taken from https://github.com/prisma-labs/graphql-request/blob/master/src/types.ts

export type Variables = { [key: string]: any };

export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: any;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: GraphQLError[];
  extensions?: any;
  status: number;
  [key: string]: any;
}

export interface GraphQLRequestContext<V = Variables> {
  query: string | string[];
  variables?: V;
}
