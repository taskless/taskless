import { createLogger, format, transports } from "winston";
import chalk from "chalk";
import { DateTime } from "luxon";

const { combine, timestamp, printf } = format;

const getDebugLevel = () => {
  const level = process.env.TASKLESS_DEV_DEBUG ?? "info";
  return ["debug", "log", "info", "warn", "error"].includes(level)
    ? level
    : "info";
};

const colorizedLabel = {
  info: chalk.blue,
  warn: chalk.yellow,
  error: chalk.red,
};

const logFormat = printf(({ level, message, label, job, timestamp }) => {
  const colorizer =
    colorizedLabel[level as keyof typeof colorizedLabel] || colorizedLabel.info;
  const dt = DateTime.fromISO(timestamp);

  const lbl = label ?? "root";
  const jobLabel = job ? `${lbl} ${job}` : null;
  const fullLabel = jobLabel ?? lbl;

  const ts = `${dt.toLocaleString(DateTime.TIME_24_WITH_SECONDS)}.${dt.get(
    "millisecond"
  )}`;

  return `${colorizer(level).padEnd(6, " ")} - ${chalk.gray(
    `${ts} (${fullLabel})`
  )} ${message}`;
});

export const logger = createLogger({
  format: combine(timestamp(), logFormat),
  transports: [
    new transports.Console({
      level: getDebugLevel(),
    }),
  ],
});
