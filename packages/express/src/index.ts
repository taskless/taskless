import {
  Queue,
  tasklessBody,
  type CreateQueueMethods,
  type JobHandler,
  type QueueOptions,
} from "@taskless/client";
import * as express from "express";

// re-export core client
export * from "@taskless/client";

/**
 * An Express compatible API Handler, with Taskless Queue support
 * @template T Used for typing the {@link CreateQueueMethods}
 */
export interface TasklessExpressRouter<T> extends CreateQueueMethods<T> {
  /**
   * Generate an express Router object, optionally with mount information.
   * Unfortunately, express does not provide a way for a router to retrieve its `mountpath`,
   * making it impossible to determine the full routing URL at runtime. Because of this
   * limitation, the router must be created on-demand.
   * ([docs](https://taskless.io/docs/packages/express#express-methods))
   * @param mount Specify an optional mount path for this express router
   * @returns An express Router object
   */
  router: (mount?: string) => express.Router;
}

/**
 * Creates an Express Router object augmented with Taskess Queue methods
 * @template T Describes the payload and is passed through to {@link JobHandler}
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
): TasklessExpressRouter<T> {
  let mountAt: string | undefined;
  let isMounted = false;

  /** Create a clean route, combining the optional mount with the queue path */
  const cleanRoute = (pth: string, mnt?: string) => {
    const parts: string[] = [
      ...(typeof mnt === "undefined" ? [] : mnt.split("/")),
      ...pth.split("/"),
    ].filter((v) => typeof v !== "undefined" && v !== "");
    return "/" + parts.join("/");
  };

  const t = new Queue({
    name,
    route: () => {
      if (!isMounted) {
        throw new Error(
          "TasklessExpressRouter must be mounted via router() before use"
        );
      }
      return cleanRoute(route, mountAt);
    },
    handler,
    queueOptions,
  });

  /**
   * Create a mount point for the express rotuer, returning a router capable
   * of receiving inbound requests
   * @param at specify an optional mount point in more complex applications with sub routers
   * @param options provide any additional {@link express.RouterOptions} values
   * @returns An express router
   */
  const mount = (
    at?: string,
    options?: express.RouterOptions
  ): express.Router => {
    if (isMounted) {
      throw new Error("TasklessExpressRouter should not be mounted twice");
    }

    mountAt = at ?? "/";
    isMounted = true;

    const handle: express.RequestHandler = (request, response, next) => {
      // compatible with express' non-sync handlers
      const run = async () => {
        await t.receive({
          getBody: () => {
            try {
              return tasklessBody.parse(request.body);
            } catch (e) {
              // console.error(e);
              throw new Error("req.body does not match a Taskless payload");
            }
          },
          getHeaders: () => request.headers,
          send: (json) => {
            response.status(200).json(json);
          },
          sendError: (statusCode, headers, json) => {
            response.status(statusCode);
            Object.getOwnPropertyNames(headers).forEach((name) => {
              response.setHeader(name, headers[name] ?? "");
            });
            response.json(json);
          },
        });
      };
      run().catch((e) => {
        next(e);
      });
    };

    const router = express.Router(options);
    const cr = cleanRoute(route);
    router.get(cr, (_req, res) => {
      res.status(400).end("Bad Request");
    });
    router.post(cleanRoute(route), [express.json(), handle]);
    return router;
  };

  // return the express rotuer API
  const queueApi: TasklessExpressRouter<T> = {
    enqueue: (name, payload, options) => t.enqueue(name, payload, options),
    cancel: (name) => t.cancel(name),
    router: (at?: string) => mount(at),
    bulk: {
      enqueue: (...args) => t.bulk.enqueue(...args),
      cancel: (...args) => t.bulk.cancel(...args),
    },
  };

  return queueApi;
}
