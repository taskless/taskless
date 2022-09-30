import { getCollection, JobDoc, RunDoc } from "db/loki";
import { getQueue, WorkerRequestError } from "db/mq";
import { DateTime } from "luxon";
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
  const jc = getCollection<JobDoc>("tds-jobs");
  const runs = getCollection<RunDoc>("tds-runs");
  q.process(async (job, api) => {
    const j = jc.findOne({
      id: job.jobId,
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
  q.events.on("ack", (info) => {
    logger.info(`ACK of ${info.ref}`);
    const now = DateTime.now();
    runs.insertOne({
      ts: now.toISO(),
      metadata: {
        id: info.ref,
        name: info.payload.name,
      },
      success: true,
      statusCode: 200,
      payload: JSON.stringify(info.payload),
      body: JSON.stringify(info.result),
    });

    jc.chain()
      .find({
        id: info.ref,
      })
      .update((doc) => {
        if (info.next) {
          doc.runAt = DateTime.fromJSDate(info.next).toISO();
        }
        doc.summary = {
          nextRun: info.next
            ? DateTime.fromJSDate(info.next).toISO()
            : undefined,
          lastRun: now.toISO(),
          lastStatus: true,
        };
      })
      .data();
  });

  // on fail, add to job db runs
  q.events.on("fail", (info) => {
    logger.info(`FAIL of ${info.ref}`);
    logger.error(info.error);
    const now = DateTime.now();

    const code =
      info.error instanceof WorkerRequestError
        ? info.error.code ?? 500
        : info.statusCode ?? 500;
    const body =
      info.error instanceof WorkerRequestError
        ? info.error.body
        : JSON.stringify(info.result) ?? "";
    const name = info.payload?.name ?? info.ref;

    runs.insertOne({
      ts: now.toISO(),
      metadata: {
        id: info.ref,
        name,
      },
      success: false,
      statusCode: code,
      payload: JSON.stringify(info.payload),
      body,
    });

    jc.chain()
      .find({
        id: info.ref,
      })
      .update((doc) => {
        if (info.next) {
          doc.runAt = DateTime.fromJSDate(info.next).toISO();
        }
        doc.summary = {
          nextRun: info.next
            ? DateTime.fromJSDate(info.next).toISO()
            : undefined,
          lastRun: now.toISO(),
          lastStatus: true,
        };
      })
      .data();
  });

  // on dead, update next if needed
  q.events.on("dead", (info) => {
    logger.info(`DEAD ITEM: ${info.ref}`);

    jc.chain()
      .find({ id: info.ref })
      .update((doc) => {
        if (!info.next) {
          return;
        }
        doc.runAt = DateTime.fromJSDate(info.next).toISO();
      })
      .data();
  });

  q.events.on("error", (err) => {
    console.error(err);
  });

  logger.info("Worker Started");

  return res.status(200).json({
    watch: true,
  });
}
