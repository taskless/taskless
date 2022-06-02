import type { DEV } from "@taskless/client";
import { DateTime } from "luxon";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Schema, Types, Document } from "mongoose";
import { v4 } from "uuid";
import getConfig from "next/config";

type JobDataFragment = DEV["JobDataFragment"];

const { serverRuntimeConfig } = getConfig();
serverRuntimeConfig.mongod().then((mongo: { getUri: () => string }) => {
  mongoose.connect(mongo.getUri());
});

/** The result of a mongo query function, as mongoose doesn't reallyt surface this */
export type MongoResult<T> =
  | T & {
      _id: Types.ObjectId;
    };

export type LockDoc = {
  name: string;
  owner: string;
  version: number;
  expires: Date;
};

const lock = new Schema<LockDoc>({
  name: {
    type: String,
    unique: true,
  },
  owner: String,
  version: Number,
  expires: {
    type: Date,
    default: () => DateTime.now().plus({ seconds: 5 }).toJSDate(),
  },
});

export type ScheduleDoc = {
  attempt?: number;
  next: Date;
};

const schedule = new Schema<ScheduleDoc>({
  attempt: {
    type: Number,
    default: 0,
  },
  next: Date,
});

export type LogDoc = {
  createdAt?: Date;
  job?: JobDoc;
  jobId: string;
  output: string;
  status: string;
  statusCode: number;
  v4id: string;
};

const logs = new Schema<LogDoc>({
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  status: String,
  statusCode: Number,
  output: String,
  job: {
    type: Types.ObjectId,
    ref: () => Job,
  },
  jobId: String,
  v4id: {
    type: String,
    default: () => v4(),
  },
});

export type JobDoc = {
  id: Types.ObjectId;
  v5id: string;
  name: string;
  endpoint: string;
  enabled?: boolean;
  retries?: number;
  createdAt: Date;
  updatedAt: Date;
  runAt: string;
  runEvery: string;
  headers?: {
    [header: string]: string;
  };
  body?: string;
  schedule: ScheduleDoc;
  logs?: LogDoc[];
};

const jobs = new Schema<JobDoc>({
  id: Schema.Types.ObjectId,
  v5id: String,
  name: String,
  enabled: {
    type: Boolean,
    default: true,
  },
  endpoint: String,
  retries: {
    type: Number,
    default: 5,
  },
  runAt: String,
  runEvery: String,
  headers: {
    type: Schema.Types.Map,
    of: String,
    required: false,
  },
  body: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
  schedule: schedule,
  logs: [
    {
      type: Schema.Types.ObjectId,
      ref: "Log",
    },
  ],
});

export const Job: mongoose.Model<JobDoc, {}, {}, {}> =
  mongoose.models.Job || mongoose.model("Job", jobs);
export const Log: mongoose.Model<LogDoc, {}, {}, {}> =
  mongoose.models.Log || mongoose.model("Log", logs);
export const Schedule: mongoose.Model<ScheduleDoc, {}, {}, {}> =
  mongoose.models.Schedule || mongoose.model("Schedule", schedule);
export const Lock: mongoose.Model<LockDoc, {}, {}, {}> =
  mongoose.models.Lock || mongoose.model("Lock", lock);

export const jobToJobFragment = (
  name: string,
  job: JobDoc
): JobDataFragment => {
  return {
    __typename: "Job",
    name: name,
    endpoint: job.endpoint,
    headers: job.headers,
    enabled: job.enabled === false ? false : true,
    body: job.body as string | null | undefined,
    retries: job.retries === 0 ? 0 : job.retries ?? 5,
    runAt: job.runAt,
    runEvery: job.runEvery,
  };
};
