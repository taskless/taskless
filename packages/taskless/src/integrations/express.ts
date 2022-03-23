import {
  JobHandler,
  JobOptions,
  QueueMethods,
  QueueOptions,
  isTasklessBody,
} from "../types.js";
import * as express from "express";
import { TasklessClient } from "../client/TasklessClient.js";

/**
 * An Express compatible API Handler, with Taskless Queue support
 * @template T Used for typing the {@link QueueMethods}
 */
export interface TasklessExpressRouter<T> extends QueueMethods<T> {
  /** The Express router object which should be mounted at Application root via `app.use()` */
  router: express.Router;
}

/**
 * Express Queue Options take all of the optional {@link QueueOptions}
 */
export type ExpressQueueOptions = QueueOptions;

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

  const router = express.Router();

  const handle: express.RequestHandler = (request, response) => {
    t.receive({
      getBody: () => {
        // https://expressjs.com/en/4x/api.html#express.json
        if (isTasklessBody(request.body)) {
          return request.body;
        }
        throw new Error("request.body does not match a Taskless payload");
      },
      getHeaders: () => request.headers,
      send: (json) => {
        response.status(200).json(json);
      },
      sendError: (json) => {
        response.status(500).json(json);
      },
    });
  };

  router.post(route, [express.json(), handle]);

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