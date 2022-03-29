import { DateTime, Duration } from "luxon";
import { jobs } from "./db";

const findNextTime = (start: DateTime, interval: Duration, until: DateTime) => {
  const sm = start.toMillis();
  const um = until.toMillis();
  const im = interval.toMillis();
  const passed = Math.floor((um - sm) / im);

  const closestStart = DateTime.fromMillis(sm + im * passed);
  return closestStart.plus(interval);
};

/** Schedules the next job run into the scheduler section of a job */
export const scheduleNext = async (id: string) => {
  const db = await jobs.connect();
  const ex = await db.get(id);
  const now = DateTime.now();
  const runAt = DateTime.fromISO(ex.data.runAt);

  // restart count at 0
  ex.schedule.attempt = 0;

  if (typeof ex.schedule.next === "undefined") {
    // previously unscheduled
    ex.schedule.check = true;
    ex.schedule.next = runAt < now ? now.toMillis() : runAt.toMillis();
  } else if (typeof ex.data.runEvery === "string") {
    // recurrence, find next time to run
    const interval = Duration.fromISO(ex.data.runEvery);
    const next = findNextTime(DateTime.fromISO(ex.data.runAt), interval, now);
    ex.schedule.check = true;
    ex.schedule.next = next.toMillis();
  } else {
    // no changes
    return ex;
  }

  await db.put(ex);
  return ex;
};

/** Removes a scheduling info from a job */
export const unschedule = async (id: string) => {
  const db = await jobs.connect();
  const ex = await db.get(id);
  ex.schedule = {};
  await db.put(ex);

  return ex;
};
