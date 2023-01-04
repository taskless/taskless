import {
  GraphQLClient as CoreGraphQLClient,
  RequestOptions,
} from "@taskless/graphinql";
import { IS_DEVELOPMENT } from "../constants.js";

interface TasklessRequestOptions extends RequestOptions {
  projectId?: string;
  queueName?: string;
  secret?: string;
}

/**
 * Extends the GraphinQL client to explicitly check for an app ID and secret
 */
export class GraphQLClient extends CoreGraphQLClient {
  constructor(endpoint: string, options: TasklessRequestOptions) {
    const { secret, projectId, queueName, ...rest } = options;

    const credentials: Record<string, string> = {};
    if (projectId && queueName && secret) {
      // use new project level auth
      credentials["x-taskless-auth-type"] = "project";
      credentials["x-taskless-id"] = projectId;
      credentials["x-taskless-secret"] = secret;
      credentials["x-taskless-role"] = `queue/name:${queueName}`;
    } else if (IS_DEVELOPMENT) {
      console.warn("Missing credentials: TASKLESS_ID/TASKLESS_SECRET");
    } else {
      throw new Error("Missing credentials: TASKLESS_ID/TASKLESS_SECRET");
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
