import { Queue } from "@taskless/client";
import {
  guards,
  type CreateQueueMethods,
  type JobHandler,
  type QueueOptions,
} from "@taskless/types";
import {
  type NextApiHandler,
  type NextApiRequest,
  type NextApiResponse,
} from "next";

// re-export core client
export * from "@taskless/client";

/**
 * A next.js compatible API Handler, with Taskless Queue support
 * @template T Used for typing the {@link CreateQueueMethods} and {@link NextMethods} objects
 * @param request The NextApiRequest which extends http#IncomingMessage
 * @param response The NextApiResponse which extends http#ServerResponse
 */
export interface TasklessNextApiHandler<T> extends NextApiHandler {
  /**
   * Next `API` route handler
   */
  (request: NextApiRequest, response: NextApiResponse): void | Promise<void>;

  /**
   * Adds an item to the queue. If an item of the same name exists, it will be
   * replaced with this new data. If a job was already scheduled with this
   * `name` property, then its information will be updated to the
   * new provided values. You should always call `enqueue()` as if you are
   * calling it for the first time.
   * ([docs](https://taskless.io/docs/packages/client#enqueue))
   * @param name The Job's identifiable name. If an array is provided, all values will be concatenated with {@link QueueOptions.separator}, which is `-` by default
   * @param payload The Job's payload to be delivered
   * @param options Job options. These overwrite the default job options specified on the queue at creation time
   * @throws Error when the job could not be created in the Taskless system
   * @returns The `Job` object
   */
  enqueue: CreateQueueMethods<T>["enqueue"];
  /**
   * Cancels any scheduled work for this item in the queue. Any jobs in
   * process are allowed to complete. If a job has recurrence, future jobs
   * will be cancelled.
   * ([docs](https://taskless.io/docs/packages/client#cancel))
   * @param name The Job's identifiable name. If an array is provided, all values will be concatenated with {@link QueueOptions.separator}, which is `-` by default
   * @throws Error if the job could not be cancelled
   * @returns The cancelled `Job` object, or `null` if no job was found with `name`
   */
  cancel: CreateQueueMethods<T>["cancel"];
  /**
   * Re-wraps an export as a {@link TasklessNextApiHandler}, used if using the next.js withX() wrapping pattern
   * ([docs](https://taskless.io/docs/packages/next#next-methods))
   * @template T Types the {@link TasklessNextApiHandler}
   */
  withQueue: (wrappedHandler: NextApiHandler) => TasklessNextApiHandler<T>;
}

/**
 * Creates a next.js compatible API Route that doubles as a Taskless Queue object
 * @template T Describes the payload and is passed through to {@link JobHandler} and {@link TasklessNextApiHandler}
 * @param name A friendly Queue name for debugging and querying on Taskless.io
 * @param route The URL path to reach this route
 * @param handler A {@link JobHandler} that supports a payload of type `T`
 * @param queueOptions The {@link QueueOptions} for this queue
 */
export function createQueue<T = undefined>(
  name: string,
  route: string,
  handler: JobHandler<T>,
  queueOptions?: QueueOptions
): TasklessNextApiHandler<T> {
  const t = new Queue({
    name,
    route,
    handler,
    queueOptions,
  });

  const handle: TasklessNextApiHandler<T> = async (
    req: NextApiRequest,
    res: NextApiResponse
  ) => {
    return await t.receive({
      getBody: () => {
        if (guards.isTasklessBody(req.body)) {
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

  handle.cancel = (name) => t.cancel(name);

  handle.withQueue = (wrappedHandler) => {
    const q = wrappedHandler as TasklessNextApiHandler<T>;
    q.enqueue = handle.enqueue;
    q.cancel = handle.cancel;
    return q;
  };

  return handle;
}
