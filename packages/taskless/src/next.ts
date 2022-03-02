import { TasklessClient } from "./client";
import type { JobHandler, QueueMethods, QueueOptions } from "./types";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

type NextMethods<T> = {
  withQueue: (wrappedHandler: NextApiHandler) => TasklessNextApiHandler<T>;
};

/**
 * A next.js compatible API Handler, with Taskless Queue support
 * @param req The NextApiRequest which extends http#IncomingMessage
 * @param res The NextApiResponse which extends http#ServerResponse
 */
interface TasklessNextApiHandler<T>
  extends NextApiHandler,
    QueueMethods<T>,
    NextMethods<T> {}

/**
 * Creates a next.js compatible API Route that doubles as a Taskless Queue object
 * @param route
 * @param handler
 * @param defaultJobOptions
 * @returns
 */
export function createQueue<T = undefined>(
  route: string,
  handler: JobHandler<T>,
  options?: QueueOptions
): TasklessNextApiHandler<T> {
  const t = new TasklessClient({
    route,
    handler,
    queueOptions: options,
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
