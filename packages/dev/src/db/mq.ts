import { Queue, MemoryDriver } from "docmq";
import { getDb } from "./loki";

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
  const db = getDb();
  if (!globalThis.memoryCache["mq"]) {
    globalThis.memoryCache["mq"] = new MemoryDriver(db);
  }

  const q = new Queue<TaskData, AckResult, WorkerRequestError>(
    globalThis.memoryCache["mq"] as MemoryDriver,
    "dev",
    {
      statInterval: 15,
    }
  );
  return Promise.resolve(q);
};
