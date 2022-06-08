import {
  GraphQLClient as CoreGraphQLClient,
  RequestOptions,
} from "@taskless/graphinql";
import { IS_PRODUCTION } from "../constants.js";

interface TasklessRequestOptions extends RequestOptions {
  appId?: string;
  secret?: string;
}

/**
 * Extends the GraphinQL client to explicitly check for an app ID and secret
 */
export class GraphQLClient extends CoreGraphQLClient {
  constructor(endpoint: string, options: TasklessRequestOptions) {
    const { appId, secret, ...rest } = options;

    if (IS_PRODUCTION && (!appId || !secret)) {
      throw new Error(
        "Missing an application ID (options.appId) or secret (options.secret)"
      );
    }

    super(endpoint, {
      ...rest,
      headers: {
        ...(rest.headers ?? {}),
        "x-taskless-app-id": appId ?? "",
        "x-taskless-secret": secret ?? "",
      },
    });
  }
}
