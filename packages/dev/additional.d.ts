declare module "boolean-parser" {
  type Term = string;
  declare function parseBooleanQuery(query: string): Term[][];
}

// https://stackoverflow.com/questions/59459312/using-globalthis-in-typescript
declare module globalThis {
  interface CronAPI {
    register(
      name: string,
      timing: string,
      handler: () => unknown | Promise<unknown>
    ): void;
    destroy(name: string): void;
  }
  export function cron(): CronAPI;

  import { MongoMemoryServer } from "mongodb-memory-server";
  export function mongo(): Promise<MongoMemoryServer>;
}
