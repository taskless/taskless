declare module "boolean-parser" {
  type Term = string;
  declare function parseBooleanQuery(query: string): Term[][];
}
