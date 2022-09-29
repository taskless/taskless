import Loki from "lokijs";

const LokiMemoryAdapter = Loki.LokiMemoryAdapter;

export interface JobDoc {
  id: string;
  name: string;
  enabled: boolean;
  endpoint: string;
  headers: string;
  method: string;
  body: string | null;
  retries: number;
  runAt: Date;
  runEvery?: string;
  summary?: {
    nextRun?: Date;
    lastRun?: Date;
    lastStatus?: boolean;
  };
  timezone?: string;
}

export interface RunDoc {
  ts: Date;
  metadata: {
    id: string;
    name: string;
  };
  success: boolean;
  statusCode: number;
  payload: string;
  body?: string;
}

export const getDb = () => {
  if (!globalThis.memoryCache["db"]) {
    const db = new Loki("docmq", {
      adapter: new LokiMemoryAdapter({
        asyncResponses: true,
      }),
    });

    db.addCollection<JobDoc>("jobs", {
      unique: ["id"],
      asyncListeners: true,
      clone: true,
    });

    db.addCollection<RunDoc>("runs", {
      asyncListeners: true,
      clone: true,
    });

    globalThis.memoryCache["db"] = db;
  }

  return globalThis.memoryCache["db"] as Loki;
};

export const getCollection = <T extends object>(
  name: "jobs" | "runs"
): Collection<T> => {
  const db = getDb();
  return db.getCollection<T>(name);
};
