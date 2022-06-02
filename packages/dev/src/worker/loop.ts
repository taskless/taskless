import { DateTime, Duration } from "luxon";
import { logger } from "winston/logger";
import phin from "phin";
import { Job, JobDoc, Log, MongoResult, Schedule } from "mongo/db";
import { findNextTime } from "./scheduler";
import { Document, Types } from "mongoose";
import { serializeError } from "serialize-error";
import getConfig from "next/config";

export const watch = () => {
  const { serverRuntimeConfig } = getConfig();
  serverRuntimeConfig.crond().register("worker", "* * * * * *", async () => {
    try {
      let jobs: MongoJob[] = [];
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
        return;
      }

      log.debug(`Found ${jobs.length} item(s)`);

      await Promise.allSettled(
        jobs.filter<MongoJob>(isMongoJob).map((job) => handle(job))
      );
    } catch (e) {
      log.error(e);
    }
  });
};

const MAX_JOB_CHUNK = 10;

// reattach mongo methods for toJSON
type MongoJob = Document<Types.ObjectId, any, JobDoc> & MongoResult<JobDoc>;

/** Simple typeguard to discard null results */
function isMongoJob(v: any): v is MongoJob {
  return v !== null;
}

const log = logger.child({
  label: "worker/loop.ts",
});

/** Handle a single instance of a job */
const handle = async (job: MongoJob) => {
  log.info("Handling Jobs");
  if (job.enabled === false) {
    // disabled
    return;
  }

  const now = DateTime.now();
  const l = log.child({ job: job.name });
  l.info("Handler invoked");

  let retry = false;

  const entry = new Log({
    isNew: true,
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
    l.info("Making Request");
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
    const ser = serializeError(e);
    const msg =
      typeof e === "string" ? e : e instanceof Error ? e.message : `${e}`;
    l.error(`Error received: ${msg}`);
    retry = (job.schedule?.attempt ?? 0) < (job.retries ?? 0) - 1;
    entry.status = "FAILED";
    entry.statusCode = 500;
    entry.output = JSON.stringify({
      "@taskless/dev": true,
      error: ser,
    });
  }

  log.info("Recording results");
  if (!job.logs) {
    job.logs = [];
  }
  job.logs.push(entry);
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
