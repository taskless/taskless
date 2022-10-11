// types are not complex enough to warrant an @types submission
declare module "boolean-parser" {
  type Term = string;
  export function parseBooleanQuery(query: string): Term[][];
}
