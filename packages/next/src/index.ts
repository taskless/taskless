import {
  Queue,
  tasklessBody,
  type CreateQueueMethods,
  type JobHandler,
  type QueueOptions,
} from "@taskless/client";
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
export interface TasklessNextApiHandler<T>
  extends NextApiHandler,
    CreateQueueMethods<T> {
  /**
   * Next `API` route handler
   */
  (request: NextApiRequest, response: NextApiResponse): void | Promise<void>;

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
 * @param options The {@link QueueOptions} for this queue
 */
export function createQueue<T = undefined>(
  name: string,
  route: string,
  handler: JobHandler<T>,
  options?: QueueOptions
): TasklessNextApiHandler<T> {
  const t = new Queue({
    name,
    route,
    handler,
    queueOptions: options,
  });

  // a next.js API handler
  const handle: TasklessNextApiHandler<T> = async (
    req: NextApiRequest,
    res: NextApiResponse
  ) => {
    return await t.receive({
      getBody: () => {
        try {
          return tasklessBody.parse(req.body);
        } catch (e) {
          // console.error(e);
          throw new Error("req.body does not match a Taskless payload");
        }
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

  // Taskless methods
  handle.enqueue = (...args) => t.enqueue(...args);
  handle.cancel = (...args) => t.cancel(...args);
  handle.bulk = {
    cancel: (...args) => t.bulk.cancel(...args),
    enqueue: (...args) => t.bulk.enqueue(...args),
  };

  // Next.js specific support
  handle.withQueue = (wrappedHandler) => {
    const q = wrappedHandler as TasklessNextApiHandler<T>;
    q.enqueue = handle.enqueue;
    q.cancel = handle.cancel;
    return q;
  };

  return handle;
}
