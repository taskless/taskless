import express from "express";
import MyQueue from "./queues/sample.js";

const router = express.Router();

/* GET run a sample job */
router.get("/", function (req, res, next) {
  MyQueue.enqueue("sample-job", {
    message: "This is a sample express job",
  });
  res.status(200).send("ok");
});

export default router;
