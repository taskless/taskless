// this file is imported via server.js as a global on the server
// it creates a single mongo instance, accessible across the app
// the exported function returns the promise. As a global, it will
// also survive hmr
// ref: https://www.mongodb.com/docs/manual/reference/program/mongod
const { MongoMemoryReplSet } = require("mongodb-memory-server");

/** @type {Promise<MongoMemoryReplSet>} */
module.exports = MongoMemoryReplSet.create({
  replSet: {
    count: 1,
    name: "tds",
    storageEngine: "wiredTiger",
    oplogSize: 1,
  },
  args: [
    // some args that make wiredTiger more stable in a WLS/VM environment
    "--wiredTigerCacheSizeGB 0.25",
    "--wiredTigerJournalCompressor none",
  ],
}).catch((e) => {
  console.error("Could not start a mongo server");
  if (e?.message) {
    console.error(e.message);
  }
  process.exit(1);
});
