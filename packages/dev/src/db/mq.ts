import { Queue, MemoryDriver } from "docmq";

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
  if (!globalThis.memoryCache["mq"]) {
    globalThis.memoryCache["mq"] = new MemoryDriver("default");
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
