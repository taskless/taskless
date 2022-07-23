declare module "boolean-parser" {
  type Term = string;
  declare function parseBooleanQuery(query: string): Term[][];
}

// ref: https://stackoverflow.com/questions/59459312/using-globalthis-in-typescript
declare module globalThis {
  import { MongoClient } from "mongodb";
  import { MongoMemoryReplSet } from "mongodb-memory-server"
  function mongoMemoryReplSet(): Promise<MongoMemoryReplSet>;
  var mongoClientCache: Record<string, Promise<MongoClient>>;
}

declare module "./server/mongo.js" {
  import { MongoMemoryReplSet } from "mongodb-memory-server"
  export = Promise<MongoMemoryReplSet>
}