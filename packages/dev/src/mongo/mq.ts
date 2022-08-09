import { Queue, MongoDriver } from "docmq";
import { getClient } from "./client";

export interface TaskData {
  projectId: string;
  queueName: string;
  jobId: string;
  name: string;
  endpoint: string;
  headers: string;
  method: string;
  body: string | null;
}

interface AckResult {
  statusCode: number;
  body: string;
}

export class WorkerRequestError extends Error {
  code: number | undefined;
  body: string | undefined;
}

export const getQueue = async () => {
  const c = await getClient();
  const q = new Queue<TaskData, AckResult, WorkerRequestError>(
    new MongoDriver(c),
    "dev",
    {
      statInterval: 15,
    }
  );
  return q;
};
