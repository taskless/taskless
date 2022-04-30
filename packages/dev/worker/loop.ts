import { DateTime } from "luxon";
import { jobs, logs } from "./db";
import { logger } from "winston/logger";
import { Job, JobLog } from "types";
import phin from "phin";
import { scheduleNext } from "./scheduler";
import { v4 } from "uuid";

const WAIT_INTERVAL = 300;
const log = logger.child({
  label: "worker/loop.ts",
});

let started = false;
/** Start the in-memory worker process. Protects itself against multiple instances */
export const start = () => {
  if (started) {
    return;
  }

  started = true;
  setTimeout(tick, WAIT_INTERVAL);
  log.info("Started worker");
};

/** Find all jobs that are ready to run and asynchronously handle them */
const tick = async () => {
  const now = DateTime.now().toMillis();
  const db = await jobs.connect();
  const next = await db.find({
    selector: {
      "schedule.check": {
        $eq: true,
      },
      "schedule.next": {
        $lte: now,
      },
    },
  });

  if (!next || !next?.docs || next.docs?.length === 0) {
    // nothing to do
    setTimeout(tick, WAIT_INTERVAL);
    return;
  }

  log.debug(`Found ${next?.docs?.length ?? 0} item(s)`);

  // run all pending jobs to complete/fail state
  await Promise.allSettled(next.docs.map((doc) => handle(doc._id, doc)));
  setTimeout(tick, WAIT_INTERVAL);
};

/** Handle a single instance of a job */
const handle = async (id: string, doc: Job) => {
  const db = await jobs.connect();
  const ldb = await logs.connect();

  const now = DateTime.now();
  const l = log.child({ job: doc.data.name });
  l.info("Handler invoked");
  let retry = false;
  let logEntry: JobLog["data"] | undefined = undefined;

  const headers = {
    ...(doc.data.headers ?? {}),
    "user-agent": "Taskless DevServer Worker",
    "content-type": "application/json",
  };

  const request: phin.IOptions = {
    url: doc.data.endpoint,
    method: "POST",
    headers,
    // attach data if set
    ...(doc.data.payload ? { data: doc.data.payload } : {}),
    followRedirects: true,
    timeout: 15000,
  };
  l.debug(`Phin Request: \n${JSON.stringify(request)}`);

  try {
    const resp = await phin({
      ...request,
      parse: "json",
    });
    logEntry = {
      status: `${resp.statusCode}`.indexOf("2") === 0 ? "COMPLETED" : "FAILED",
      statusCode: resp.statusCode ?? 200,
      output: JSON.stringify(resp.body),
    };
    if (`${resp.statusCode}`.indexOf("2") !== 0) {
      l.warn(`Non-2xx received from url: ${doc.data.endpoint}`);
      retry = (doc.schedule.attempt ?? 0) < doc.data.retries;
    }
  } catch (e) {
    const msg =
      typeof e === "string" ? e : e instanceof Error ? e.message : `${e}`;
    l.error(`Error received: ${msg}`);
    retry = (doc.schedule.attempt ?? 0) < doc.data.retries;
    logEntry = {
      status: "FAILED",
      statusCode: 500,
      output: JSON.stringify({
        "@taskless/dev": true,
        error: msg,
      }),
    };
  }

  try {
    // log result
    await ldb.put({
      _id: v4(),
      jobId: id,
      createdAt: new Date().getTime(),
      data: logEntry,
    });

    // update doc record. If retrying, schedule the retry
    doc.schedule.check = false;
    if (retry) {
      l.info("Linear rescheduling of job");
      doc.schedule.check = true;
      doc.schedule.next = now.plus({ seconds: 3 }).toMillis();
      doc.schedule.attempt = (doc.schedule.attempt ?? 0) + 1;
    }
    await db.put(doc);

    // if not retrying, schedule the next occurence (if applicable)
    if (!retry && doc.data.runEvery) {
      l.info("Scheduling next occurence");
      await scheduleNext(id);
    }
  } catch (e) {
    l.error(`Error received: ${e}`);
  }
};
