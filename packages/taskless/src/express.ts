import type {
  JobHandler,
  JobOptions,
  QueueMethods,
  QueueOptions,
} from "./types";
import type * as Express from "express";
import { isTasklessBody } from "./types.guard.js";
import { TasklessClient } from "./client/TasklessClient";

/**
 * An Express compatible API Handler, with Taskless Queue support
 * @template T Used for typing the {@link QueueMethods}
 */
export interface TasklessExpressRouter<T> extends QueueMethods<T> {
  /** The Express router object which should be mounted at Application root via `app.use()` */
  router: Express.Router;
}

/**
 * Express Queue Options take all of the optional {@link QueueOptions}, but also
 * require you to declare your `router` and `middleware` implementation. In most
 * cases, you can pass in an instance of an express Router and a middleware that
 * includes at a minimum the express json body parser.
 * @example ```ts
 * {
 *   // other QueueOptions can be included
 *   router: express.Router(),
 *   middleware: [express.json()]
 * }
 * ```
 */
export type ExpressQueueOptions = QueueOptions & {
  /** An instance of an Express Router */
  router: Express.Router;
  /** An array of Express middleware, containing at a minimum express.json() */
  middleware: Express.RequestHandler[];
};

/**
 * Creates an Express Router object augmented with Taskess Queue methods
 * @template T Describes the payload and is passed through to {@link JobHandler}
 * @param route The URL path to reach this route
 * @param handler A {@link JobHandler} that supports a payload of type `T`
 * @param queueOptions The {@link QueueOptions} for this queue
 * @param defaultJobOptions A set of {@link JobOptions} to apply as defaults for every new job in the Queue
 * @returns {TasklessNextApiHandler}
 */
export function createQueue<T = undefined>(
  route: string,
  handler: JobHandler<T>,
  queueOptions: ExpressQueueOptions,
  defaultJobOptions?: JobOptions
): TasklessExpressRouter<T> {
  const t = new TasklessClient({
    route,
    handler,
    queueOptions: queueOptions ?? {},
    jobOptions: defaultJobOptions ?? {},
  });

  const handle: Express.RequestHandler = (req, res, next) => {
    t.receive({
      getBody: () => {
        // https://expressjs.com/en/4x/api.html#express.json
        if (isTasklessBody(req.body)) {
          return req.body;
        }
        throw new Error(
          "req.body was not a properly formatted JavaScript object"
        );
      },
      getHeaders: () => req.headers,
      send: (json) => {
        res.status(200);
        res.json(json);
        res.end();
      },
      sendError: (json) => {
        res.status(500);
        res.json(json);
        res.end();
      },
    }).then(next);
  };

  // attach route
  const router = queueOptions.router;
  router.post(route, ...[queueOptions.middleware ?? [], handle]);

  // return API
  const queueApi: TasklessExpressRouter<T> = {
    enqueue: (name, payload, options) => t.enqueue(name, payload, options),
    update: (name, payload, options) => t.update(name, payload, options),
    delete: (name) => t.delete(name),
    get: (name) => t.get(name),
    router: router,
  };

  return queueApi;
}
