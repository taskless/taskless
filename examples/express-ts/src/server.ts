import { createQueue } from "@taskless/express";
import express from "express";
import http from "node:http";

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

const app = express();

const port = normalizePort(process.env.PORT || "8080");
app.set("port", port);

const server = http.createServer(app);

function onListening() {
  const addr = server.address();
  const bind =
    typeof addr === "string" ? "pipe " + addr : "port " + addr.port.toString();
  console.log("Listening on " + bind);
}

const wait = (amount: number) =>
  new Promise((resolve) => setTimeout(resolve, amount));

const queue = createQueue("sample queue", "/sample", async (job, meta) => {
  await wait(100);
  console.log(job, meta);
});

const router = express.Router();
router.use("/integrations/taskless", queue.router("/integrations/taskless"));

server.listen(port);
server.on("listening", onListening);
