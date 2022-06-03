// custom server.js
// https://nextjs.org/docs/advanced-features/custom-server
// allows us to start our cron/mongo singletons and fire off a "start" request to the worker

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const phin = require("phin");

// assign cron and mongo to the global scope
global.cron = require("./server/cron");
global.mongo = require("./server/mongo");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.TASKLESS_DEV_HOSTNAME ?? "localhost";
const port = process.env.TASKLESS_DEV_PORT
  ? parseInt(process.env.TASKLESS_DEV_PORT, 10) ?? 3001
  : 3001;

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    // start worker via URL request
    phin(new URL("/api/worker", `http://${hostname}:${port}`).toString());
  });
});
