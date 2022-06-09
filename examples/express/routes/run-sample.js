const express = require("express");
const MyQueue = require("./queues/sample");

const router = express.Router();

/* GET run a sample job */
router.get("/", function (req, res, next) {
  MyQueue.enqueue("sample-job", {
    message: "This is a sample express job",
  })
    .then(() => {
      res.status(200).send("ok");
    })
    .catch((ex) => {
      console.error(ex);
    });
});

module.exports = router;
