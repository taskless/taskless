import { TasklessClient } from "./client.js";
import type {
  JobHandler,
  JobOptions,
  QueueMethods,
  QueueOptions,
} from "./types.js";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * Re-wraps an export as a {@link TasklessNextApiHandler}, used if using the next.js withX() wrapping pattern
 * @template T Types the {@link TasklessNextApiHandler}
 */
type NextMethods<T> = {
  withQueue: (wrappedHandler: NextApiHandler) => TasklessNextApiHandler<T>;
};

/**
 * A next.js compatible API Handler, with Taskless Queue support
 * @template T Used for typing the {@link QueueMethods} and {@link NextMethods} objects
 * @param req The NextApiRequest which extends http#IncomingMessage
 * @param res The NextApiResponse which extends http#ServerResponse
 */
export interface TasklessNextApiHandler<T>
  extends NextApiHandler,
    QueueMethods<T>,
    NextMethods<T> {}

/**
 * Creates a next.js compatible API Route that doubles as a Taskless Queue object
 * @template T Describes the payload and is passed through to {@link JobHandler} and {@link TasklessNextApiHandler}
 * @param route The URL path to reach this route
 * @param handler A {@link JobHandler} that supports a payload of type `T`
 * @param queueOptions The {@link QueueOptions} for this queue
 * @param defaultJobOptions A set of {@link JobOptions} to apply as defaults for every new job in the Queue
 * @returns {TasklessNextApiHandler}
 */
export function createQueue<T = undefined>(
  route: string,
  handler: JobHandler<T>,
  queueOptions?: QueueOptions,
  defaultJobOptions?: JobOptions
): TasklessNextApiHandler<T> {
  const t = new TasklessClient({
    route,
    handler,
    queueOptions: queueOptions ?? {},
    jobOptions: defaultJobOptions ?? {},
  });

  const handle: TasklessNextApiHandler<T> = async (
    req: NextApiRequest,
    res: NextApiResponse
  ) => {
    return t.receive({
      getBody: () => req.body,
      getHeaders: () => req.headers,
      send: (json) => res.status(200).json(json),
      sendError: (json) => res.status(500).json(json),
    });
  };

  handle.enqueue = (name, payload, options) =>
    t.enqueue(name, payload, options);

  handle.update = (name, payload, options) => t.update(name, payload, options);

  handle.delete = (name) => t.delete(name);

  handle.get = (name) => t.get(name);

  handle.withQueue = (wrappedHandler) => {
    const q = wrappedHandler as TasklessNextApiHandler<T>;
    q.enqueue = handle.enqueue;
    q.update = handle.update;
    q.delete = handle.delete;
    q.get = handle.get;
    return q;
  };

  return handle;
}
