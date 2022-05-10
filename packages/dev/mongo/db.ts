import { JobDataFragment } from "@taskless/client/dev";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose, { Schema, Types, Document } from "mongoose";

// @ts-ignore
if (!global.mongod) {
  // @ts-ignore
  global.mongod = true;
  MongoMemoryServer.create().then((mongod) => {
    // @ts-ignore
    global.mongod = mongod;
    mongoose.connect(mongod.getUri());
  });
}

interface ScheduleDoc extends Document {
  next: Date;
  attempt?: number;
}

const schedule = new Schema<ScheduleDoc>({
  next: Date,
  attempt: {
    type: Number,
    default: 0,
  },
});

export interface LogDoc extends Document {
  createdAt?: Date;
  status: string;
  statusCode: number;
  output: string;
  job?: JobDoc;
  jobId: string;
}

const logs = new Schema<LogDoc>({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: String,
  statusCode: Number,
  output: String,
  job: {
    type: Types.ObjectId,
    ref: () => Job,
  },
  jobId: String,
});

export interface JobDoc extends Document {
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
}

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
      type: Types.ObjectId,
      ref: () => Log,
    },
  ],
});

export const Job: mongoose.Model<JobDoc, {}, {}, {}> =
  mongoose.models.Job || mongoose.model("Job", jobs);
export const Log: mongoose.Model<LogDoc, {}, {}, {}> =
  mongoose.models.Log || mongoose.model("Log", logs);
export const Schedule: mongoose.Model<ScheduleDoc, {}, {}, {}> =
  mongoose.models.Schedule || mongoose.model("Schedule", schedule);

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
