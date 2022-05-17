import type {
  JobHandler,
  QueueOptions,
  DefaultJobOptions,
  CreateQueueMethods,
} from "@taskless/types";

import * as express from "express";
import { Queue } from "@taskless/client";
import { Guards } from "@taskless/types";

// re-export core client
export * from "@taskless/client";

/**
 * An Express compatible API Handler, with Taskless Queue support
 * @template T Used for typing the {@link CreateQueueMethods}
 */
export interface TasklessExpressRouter<T> {
  // express does not have a default handler
  // queue methods
  enqueue: CreateQueueMethods<T>["enqueue"];
  update: CreateQueueMethods<T>["update"];
  delete: CreateQueueMethods<T>["delete"];
  get: CreateQueueMethods<T>["get"];
  // custom
  /**
   * Generate an express Router object, optionally with mount information.
   * Unfortunately, express does not provide a way for a router to retrieve its `mountpath`,
   * making it impossible to determine the full routing URL at runtime. Because of this
   * limitation, the router must be created on-demand.
   * @param mount Specify an optional mount path for this express router
   */
  router: (mount?: string) => express.Router;
}

/**
 * Express Queue Options. See: {@link QueueOptions}
 */
export type ExpressQueueOptions = QueueOptions;

/**
 * Creates an Express Router object augmented with Taskess Queue methods
 * @template T Describes the payload and is passed through to {@link JobHandler}
 * @param name A friendly Queue name for debugging and querying on Taskless.io
 * @param route The URL path to reach this route
 * @param handler A {@link JobHandler} that supports a payload of type `T`
 * @param queueOptions The {@link QueueOptions} for this queue
 * @param defaultJobOptions A set of {@link JobOptions} to apply as defaults for every new job in the Queue
 * @returns {TasklessNextApiHandler}
 */
export function createQueue<T = undefined>(
  name: string,
  route: string,
  handler: JobHandler<T>,
  queueOptions?: ExpressQueueOptions,
  defaultJobOptions?: DefaultJobOptions
): TasklessExpressRouter<T> {
  let mountAt: string | undefined;
  let isMounted = false;

  const cleanRoute = (pth: string, mnt?: string) => {
    return (mnt ?? "") + (pth.indexOf("/") === 0 ? pth.substring(1) : pth);
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
    queueOptions: queueOptions ?? {},
    jobOptions: defaultJobOptions ?? {},
  });

  /**
   * Create a mount point for the express rotuer, returning a router capable
   * of receiving inbound requests
   * @param at specify an optional mount point in more complex applications with sub routers
   * @returns {express.Router}
   */
  const mount = (at?: string) => {
    if (isMounted) {
      throw new Error("TasklessExpressRouter should not be mounted twice");
    }

    const router = express.Router();
    mountAt = at ?? "/";
    isMounted = true;

    const handle: express.RequestHandler = (request, response, next) => {
      // compatible with express' non-sync handlers
      const run = async () => {
        await t.receive({
          getBody: () => {
            // https://expressjs.com/en/4x/api.html#express.json
            if (Guards.TasklessBody.isTasklessBody(request.body)) {
              return request.body;
            }
            throw new Error("request.body does not match a Taskless payload");
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

    router.post(cleanRoute(route, at), [express.json(), handle]);
    return router;
  };

  // return the express rotuer API
  const queueApi: TasklessExpressRouter<T> = {
    enqueue: (name, payload, options) => t.enqueue(name, payload, options),
    update: (name, payload, options) => t.update(name, payload, options),
    delete: (name) => t.delete(name),
    get: (name) => t.get(name),
    router: (at?: string) => mount(at),
  };

  return queueApi;
}
