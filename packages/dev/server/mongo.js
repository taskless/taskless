// this file is imported via next.config.js as runtime configuration on the server
// it creates a single mongo instance, accessible across the app
const { MongoMemoryServer } = require("mongodb-memory-server");

const mongod = new Promise((resolve) => {
  MongoMemoryServer.create()
    .then((mongod) => {
      resolve(mongod);
    })
    .catch(() => {
      console.error("Could not start a mongo server in-memory");
      process.exit(1);
    });
});

module.exports = () => mongod;
