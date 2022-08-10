import { getJobsCollection, getRunsCollection } from "mongo/collections";
import { getQueue, WorkerRequestError } from "mongo/mq";
import type { NextApiRequest, NextApiResponse } from "next";
import phin from "phin";
import { logger } from "winston/logger";

/** Stats a worker cron that polls and manages events in development */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // begin processing. Workers are idempotent. Adding a new worker sets the worker for future runs safely
  const q = await getQueue();
  const jc = await getJobsCollection();
  const runs = await getRunsCollection();
  q.process(async (job, api) => {
    const j = await jc.findOne({
      v5id: job.jobId,
    });

    if (!j) {
      return api.fail("No matching job found");
    }

    const headers = {
      ...(j.headers ? JSON.parse(j.headers) : {}),
      "user-agent": "Taskless DevServer Worker",
      "content-type": "application/json",
      "x-taskless-queue": job.queueName,
      "x-taskless-id": job.projectId,
    };

    const request: phin.IOptions = {
      url: j.endpoint,
      method: "POST",
      headers,
      // attach data if set
      ...(j.body ? { data: j.body } : {}),
      followRedirects: true,
      timeout: 15000,
    };

    let statusCode: number | undefined;
    let responseBody: string | undefined;

    try {
      const resp = await phin({
        ...request,
        parse: "json",
      });

      statusCode = resp.statusCode ?? 200;
      responseBody = JSON.stringify(resp.body);
      if (`${resp.statusCode}`.indexOf("2") !== 0) {
        const err = new WorkerRequestError("Received non-2xx response");
        err.code = statusCode;
        err.body = responseBody;
        return api.fail(err);
      }
    } catch (e) {
      console.error(e);
      return api.fail("Unknown error from phin");
    }

    return api.ack({
      statusCode: statusCode ?? 200,
      body: responseBody ?? "",
    });
  });

  // informational sync on next, fail, and dead
  q.events.on("ack", async (info) => {
    logger.info(`ACK of ${info.ref}`);
    const now = new Date();
    await runs.insertOne({
      ts: now,
      metadata: {
        v5id: info.ref,
        name: info.payload.name,
      },
      success: true,
      statusCode: 200,
      payload: JSON.stringify(info.payload),
      body: JSON.stringify(info.result),
    });

    await jc.updateOne(
      {
        v5id: info.ref,
      },
      {
        $set: {
          ...(info.next ? { runAt: info.next } : {}),
          summary: {
            nextRun: info.next,
            lastRun: now,
            lastStatus: true,
          },
        },
      }
    );
  });

  // on fail, add to job db runs
  q.events.on("fail", async (info) => {
    logger.info(`FAIL of ${info.ref}`);
    logger.error(info.error);
    const now = new Date();

    const code =
      info.error instanceof WorkerRequestError
        ? info.error.code ?? 500
        : info.statusCode ?? 500;
    const body =
      info.error instanceof WorkerRequestError
        ? info.error.body
        : JSON.stringify(info.result) ?? "";
    const name = info.payload?.name ?? info.ref;

    await runs.insertOne({
      ts: now,
      metadata: {
        v5id: info.ref,
        name,
      },
      success: false,
      statusCode: code,
      payload: JSON.stringify(info.payload),
      body,
    });

    await jc.updateOne(
      {
        v5id: info.ref,
      },
      {
        $set: {
          ...(info.next ? { runAt: info.next } : {}),
          summary: {
            nextRun: info.next,
            lastRun: now,
            lastStatus: false,
          },
        },
      }
    );
  });

  // on dead, update next if needed
  q.events.on("dead", async (info) => {
    logger.info(`DEAD ITEM: ${info.ref}`);
    if (!info.next) {
      return;
    }

    await jc.updateOne(
      {
        v5id: info.ref,
      },
      {
        $set: {
          runAt: info.next,
        },
      }
    );
  });

  q.events.on("error", (err) => {
    console.error(err);
  });

  logger.info("Worker Started");

  return res.status(200).json({
    watch: true,
  });
}
