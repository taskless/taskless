import { MongoClient } from "mongodb";

const cache = globalThis.mongoClientCache ?? {};
globalThis.mongoClientCache = cache;

export const getMongoUri = async (): Promise<string> => {
  const m = await globalThis.mongoMemoryReplSet();
  return m.getUri();
};

export const getClient = async (): Promise<MongoClient> => {
  const uri = await getMongoUri();
  if (!cache[uri]) {
    const c = new MongoClient(uri, { autoEncryption: undefined });
    cache[uri] = c.connect();
  }

  return cache[uri];
};
