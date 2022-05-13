import { Queue } from "@taskless/client";
import {
  Guards,
  JobHandler,
  QueueOptions,
  DefaultJobOptions,
  CreateQueueMethods,
} from "@taskless/types";

import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * Re-wraps an export as a {@link TasklessNextApiHandler}, used if using the next.js withX() wrapping pattern
 * @template T Types the {@link TasklessNextApiHandler}
 */
type NextMethods<T> = {
  withQueue: (wrappedHandler: NextApiHandler) => TasklessNextApiHandler<T>;
};

/**
 * A next.js compatible API Handler, with Taskless Queue support
 * @template T Used for typing the {@link CreateQueueMethods} and {@link NextMethods} objects
 * @param req The NextApiRequest which extends http#IncomingMessage
 * @param res The NextApiResponse which extends http#ServerResponse
 */
export interface TasklessNextApiHandler<T>
  extends NextApiHandler,
    CreateQueueMethods<T>,
    NextMethods<T> {}

/**
 * Creates a next.js compatible API Route that doubles as a Taskless Queue object
 * @template T Describes the payload and is passed through to {@link JobHandler} and {@link TasklessNextApiHandler}
 * @param name A friendly Queue name for debugging and querying on Taskless.io
 * @param route The URL path to reach this route
 * @param handler A {@link JobHandler} that supports a payload of type `T`
 * @param queueOptions The {@link QueueOptions} for this queue
 * @param defaultJobOptions A set of {@link DefaultJobOptions} to apply as defaults for every new job in the Queue
 * @returns {TasklessNextApiHandler}
 */
export function createQueue<T = undefined>(
  name: string,
  route: string,
  handler: JobHandler<T>,
  queueOptions?: QueueOptions,
  defaultJobOptions?: DefaultJobOptions
): TasklessNextApiHandler<T> {
  const t = new Queue({
    name,
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
      getBody: () => {
        if (Guards.TasklessBody.isTasklessBody(req.body)) {
          return req.body;
        }
        throw new Error("req.body does not match a Taskless payload");
      },
      getHeaders: () => req.headers,
      send: (json) => res.status(200).json(json),
      sendError: (code, headers, json) => {
        res.status(code);
        Object.getOwnPropertyNames(headers).forEach((name) => {
          res.setHeader(name, headers[name] ?? "");
        });
        res.json(json);
      },
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
