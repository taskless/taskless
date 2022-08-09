import {
  GraphQLClient as CoreGraphQLClient,
  RequestOptions,
} from "@taskless/graphinql";
import { IS_PRODUCTION } from "../constants.js";

interface TasklessRequestOptions extends RequestOptions {
  appId?: string;
  projectId?: string;
  queueName?: string;
  secret?: string;
}

/**
 * Extends the GraphinQL client to explicitly check for an app ID and secret
 */
export class GraphQLClient extends CoreGraphQLClient {
  constructor(endpoint: string, options: TasklessRequestOptions) {
    const { appId, secret, projectId, queueName, ...rest } = options;

    const credentials: Record<string, string> = {};

    if (projectId && queueName && secret) {
      credentials["x-taskless-id"] = projectId;
      credentials["x-taskless-queue"] = queueName;
      credentials["x-taskless-secret"] = secret;
    } else if (appId && secret) {
      credentials["x-taskless-app-id"] = appId;
      credentials["x-taskless-secret"] = secret;
    } else if (IS_PRODUCTION) {
      throw new Error(
        "Missing credentials: either TASKLESS_ID/TASKLESS_SECRET or TASKLESS_APP_ID/TASKLESS_SECRET"
      );
    } else {
      console.warn(
        "Missing credentials: either TASKLESS_ID/TASKLESS_SECRET or TASKLESS_APP_ID/TASKLESS_SECRET"
      );
    }

    super(endpoint, {
      ...rest,
      headers: {
        ...(rest.headers ?? {}),
        ...credentials,
      },
    });
  }
}
