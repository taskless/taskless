import { DateTime, Duration } from "luxon";

export const findNextTime = (
  start: DateTime,
  interval: Duration,
  until: DateTime
) => {
  const sm = start.toMillis();
  const um = until.toMillis();
  const im = interval.toMillis();
  const passed = Math.floor((um - sm) / im);

  const closestStart = DateTime.fromMillis(sm + im * passed);
  return closestStart.plus(interval);
};
