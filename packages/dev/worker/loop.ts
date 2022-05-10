import { DateTime, Duration } from "luxon";
import { logger } from "winston/logger";
import phin from "phin";
import { Job, JobDoc, Log, Schedule } from "mongo/db";
import { findNextTime } from "./scheduler";

const WAIT_INTERVAL = 100;
const MAX_JOB_CHUNK = 10;

const log = logger.child({
  label: "worker/loop.ts",
});

/** Simple typeguard to discard null results */
function isJobDoc(v: any): v is JobDoc {
  return v !== null;
}

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
  let jobs: JobDoc[] = [];
  while (jobs.length < MAX_JOB_CHUNK) {
    const next = await Job.findOneAndUpdate(
      {
        "schedule.next": {
          $lt: new Date(),
        },
      },
      {
        $set: {
          schedule: null,
        },
      },
      {
        new: true,
      }
    ).exec();

    if (!next) {
      break;
    }
    jobs.push(next);
  }

  if (jobs.length === 0) {
    // nothing to do
    setTimeout(tick, WAIT_INTERVAL);
    return;
  }

  log.debug(`Found ${jobs.length} item(s)`);

  await Promise.allSettled(
    jobs.filter<JobDoc>(isJobDoc).map((job) => handle(job))
  );
  setTimeout(tick, WAIT_INTERVAL);
};

/** Handle a single instance of a job */
const handle = async (job: JobDoc) => {
  if (job.enabled === false) {
    // disabled
    return;
  }

  const now = DateTime.now();
  const l = log.child({ job: job.name });
  l.info("Handler invoked");

  let retry = false;

  const entry = new Log({
    job: job._id,
    jobId: job.v5id,
  });

  const jjson = job.toJSON();

  const headers = {
    ...(jjson.headers ?? {}),
    "user-agent": "Taskless DevServer Worker",
    "content-type": "application/json",
  };

  const request: phin.IOptions = {
    url: job.endpoint,
    method: "POST",
    headers,
    // attach data if set
    ...(job.body ? { data: job.body } : {}),
    followRedirects: true,
    timeout: 15000,
  };
  l.debug(`Phin Request: \n${JSON.stringify(request)}`);

  try {
    const resp = await phin({
      ...request,
      parse: "json",
    });

    entry.status =
      `${resp.statusCode}`.indexOf("2") === 0 ? "COMPLETED" : "FAILED";
    entry.statusCode = resp.statusCode ?? 200;
    entry.output = JSON.stringify(resp.body);
    if (`${resp.statusCode}`.indexOf("2") !== 0) {
      l.warn(`Non-2xx received from url: ${job.endpoint}`);
      retry = (job.schedule.attempt ?? 0) < (job.retries ?? 0) - 1;
    }
  } catch (e) {
    const msg =
      typeof e === "string" ? e : e instanceof Error ? e.message : `${e}`;
    l.error(`Error received: ${msg}`);
    retry = (job.schedule.attempt ?? 0) < (job.retries ?? 0) - 1;
    entry.status = "FAILED";
    entry.statusCode = 500;
    entry.output = JSON.stringify({
      "@taskless/dev": true,
      error: msg,
    });
  }

  if (!job.logs) {
    job.logs = [];
  }
  job.logs.push(entry._id);

  // save log
  await entry.save();

  // next scheduling
  if (retry) {
    l.info("Linear rescheduling of job");
    job.schedule = new Schedule({
      next: now.plus({ seconds: 3 }).toJSDate(),
      attempt: (job.schedule.attempt ?? 0) + 1,
    });
  }
  if (!retry && job.runEvery) {
    l.info("Scheduling next occurence");
    const runAt = DateTime.fromISO(job.runAt);
    const interval = Duration.fromISO(job.runEvery);
    const nextRun = findNextTime(runAt, interval, now);
    job.schedule = new Schedule({
      next: nextRun.toJSDate(),
      attempt: 0,
    });
  }

  await job.save();
};
