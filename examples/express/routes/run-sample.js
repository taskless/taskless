import express from "express";
import MyQueue from "./queues/sample";

const router = express.Router();

/* GET run a sample job */
router.get("/", function (req, res, next) {
  MyQueue.enqueue("sample-job");
});

export default router;
