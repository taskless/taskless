declare module "boolean-parser" {
  type Term = string;
  declare function parseBooleanQuery(query: string): Term[][];
}

// https://stackoverflow.com/questions/59459312/using-globalthis-in-typescript
declare module globalThis {
  import { MongoMemoryServer } from "mongodb-memory-server";
  var mongod: boolean | MongoMemoryServer;
}
