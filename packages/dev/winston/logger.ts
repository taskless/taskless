import { createLogger, format, transports } from "winston";
import chalk from "chalk";
import { DateTime } from "luxon";

const { combine, timestamp, label, printf } = format;

const getDebugLevel = () => {
  const level = process.env.TASKLESS_DEV_DEBUG ?? "error";
  return ["log", "info", "warn", "error"].includes(level) ? level : "error";
};

const colorizedLabel = {
  info: chalk.blue,
  warn: chalk.yellow,
  error: chalk.red,
};

const logFormat = printf(({ level, message, label, timestamp }) => {
  const colorizer =
    colorizedLabel[level as keyof typeof colorizedLabel] || colorizedLabel.info;
  const dt = DateTime.fromISO(timestamp);
  return `${colorizer(level).padEnd(6, " ")} - ${chalk.gray(
    dt.toLocaleString(DateTime.TIME_24_WITH_SECONDS) +
      "." +
      dt.get("millisecond")
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
