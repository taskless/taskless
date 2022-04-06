export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Literally any value */
  Any: any;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  /**
   * A string representing a duration conforming to the ISO8601 standard,
   * such as: P1W1DT13H23M34S
   * P is the duration designator (for period) placed at the start of the duration representation.
   * Y is the year designator that follows the value for the number of years.
   * M is the month designator that follows the value for the number of months.
   * W is the week designator that follows the value for the number of weeks.
   * D is the day designator that follows the value for the number of days.
   * T is the time designator that precedes the time components of the representation.
   * H is the hour designator that follows the value for the number of hours.
   * M is the minute designator that follows the value for the number of minutes.
   * S is the second designator that follows the value for the number of seconds.
   *
   * Note the time designator, T, that precedes the time value.
   *
   * Matches moment.js, Luxon and DateFns implementations
   * ,/. is valid for decimal places and +/- is a valid prefix
   */
  Duration: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** A field whose value is a generic Universally Unique Identifier: https://en.wikipedia.org/wiki/Universally_unique_identifier. */
  UUID: any;
};

export type Application = Node &
  Stamped & {
    __typename?: "Application";
    /** The date & time this was created */
    createdAt: Scalars["DateTime"];
    id: Scalars["ID"];
    /** A list of Jobs for this Application */
    jobs?: Maybe<Array<Maybe<Job>>>;
    /** The common name for the Application */
    name: Scalars["String"];
    /** The date & time this was last updated */
    updatedAt: Scalars["DateTime"];
  };

export type ApplicationJobsArgs = {
  limit?: InputMaybe<Scalars["Int"]>;
  offset?: InputMaybe<Scalars["Int"]>;
};

export type CreateJobInputType = {
  /** The body to send to the specified endpoint */
  body?: InputMaybe<Scalars["String"]>;
  /** Identifies if the job is currently enabled, defaults to TRUE */
  enabled?: InputMaybe<Scalars["Boolean"]>;
  /** The URL to request */
  endpoint: Scalars["String"];
  /** Optional headers to include with the request */
  headers?: InputMaybe<Array<HeaderInputType>>;
  /** The HTTP method to use when calling the endpoint */
  method?: InputMaybe<JobMethodEnum>;
  /** Specify a cosmetic name for the queue to help with searching and debugging */
  queue?: InputMaybe<Scalars["String"]>;
  /** If the job fails, how many times should it be retried? Defaults to 5. */
  retries?: InputMaybe<Scalars["Int"]>;
  /** A time in the future when this job should be run. If ommitted, defaults to immediately on receipt. You cannot specify `runAt` and `cron` at the same time */
  runAt?: InputMaybe<Scalars["DateTime"]>;
  /** Converts the Job to a recurring Job. Subsequent runs will occur this `duration` after every execution */
  runEvery?: InputMaybe<Scalars["Duration"]>;
};

/** A header key/value pair */
export type HeaderInputType = {
  /** The header's name */
  name: Scalars["String"];
  /** The header's value */
  value: Scalars["String"];
};

/**
 * Describes a Taskless Job. Job names are unique to the application and
 * specify both the requested time for their first inovcation and timestamps
 * for subsequent runs. In addition to a name, Jobs are given a unique ID
 * that is a UUID v5 identifier of the Job's name, with the UUID of the
 * Application as the namespace.
 */
export type Job = Node &
  Stamped & {
    __typename?: "Job";
    /** The Application that owns this Job */
    application?: Maybe<Application>;
    /** Optional body content to include with the request */
    body?: Maybe<Scalars["String"]>;
    /** The date & time this was created */
    createdAt: Scalars["DateTime"];
    /** Specifies if the job is currently enabled */
    enabled: Scalars["Boolean"];
    /** The URL to call when this Job runs */
    endpoint: Scalars["String"];
    /** Optional key/value pairs to be sent as headers to the endpoint */
    headers?: Maybe<Scalars["JSON"]>;
    id: Scalars["ID"];
    /** The HTTP method to use when calling this endpoint */
    method: JobMethodEnum;
    /** The common name for the Job, unique to the application */
    name: Scalars["String"];
    /** The number of attempts that will be made before the job run is marked as FAILED */
    retries: Scalars["Int"];
    /** When in the future this Job should first be run */
    runAt: Scalars["DateTime"];
    /**
     * Make the Job recurring by waiting this amount of time between
     * invocations. Time is defined as a standard ISO-8601 duration
     */
    runEvery?: Maybe<Scalars["Duration"]>;
    /** Any Runners associated with the Job */
    runners?: Maybe<Array<Maybe<Runner>>>;
    /** The date & time this was last updated */
    updatedAt: Scalars["DateTime"];
  };

/**
 * Describes a Taskless Job. Job names are unique to the application and
 * specify both the requested time for their first inovcation and timestamps
 * for subsequent runs. In addition to a name, Jobs are given a unique ID
 * that is a UUID v5 identifier of the Job's name, with the UUID of the
 * Application as the namespace.
 */
export type JobRunnersArgs = {
  limit?: InputMaybe<Scalars["Int"]>;
  offset?: InputMaybe<Scalars["Int"]>;
};

/** Valid HTTP methods for Taskless Jobs */
export enum JobMethodEnum {
  Get = "GET",
  Post = "POST",
}

export type Mutation = {
  __typename?: "Mutation";
  /**
   * Create a new Job, which will call the specified endpoint at the
   * requested time. Options can be orovided for run frequency, as well
   * as headers and postable body. Will error if a Job already exists
   * with the requested name. If you would like to upsert the result,
   * instead use CreateOrUpdateJob.
   */
  createJob: Job;
  /** Delete a job by its specified name. Returns null if no matching job was deleted. */
  deleteJob?: Maybe<Job>;
  /**
   * Creates a job with the included unique name for the Application. If a
   * Job already exists with the requested name, this operation will instead
   * update the existing Job with the new values.
   */
  replaceJob: Job;
  /**
   * Updates a Job by the specified name. Will error if a job does not
   * exist inside of the Application with the requested name.
   */
  updateJob: Job;
};

export type MutationCreateJobArgs = {
  job: CreateJobInputType;
  name: Scalars["String"];
};

export type MutationDeleteJobArgs = {
  name: Scalars["String"];
};

export type MutationReplaceJobArgs = {
  job: ReplaceJobInputType;
  name: Scalars["String"];
};

export type MutationUpdateJobArgs = {
  job: UpdateJobInputType;
  name: Scalars["String"];
};

/**
 * Describes an object that is uniquely identifiable by a
 * unique ID record
 */
export type Node = {
  id: Scalars["ID"];
};

export type Query = {
  __typename?: "Query";
  application?: Maybe<Application>;
  /** Retrieve a Job by its common name */
  job?: Maybe<Job>;
  /** Return a list of jobs */
  jobs?: Maybe<Array<Maybe<Job>>>;
  /** Returns a list of Runners */
  runners?: Maybe<Array<Maybe<Runner>>>;
};

export type QueryJobArgs = {
  name: Scalars["String"];
};

export type QueryJobsArgs = {
  limit?: InputMaybe<Scalars["Int"]>;
  offset?: InputMaybe<Scalars["Int"]>;
};

export type QueryRunnersArgs = {
  limit?: InputMaybe<Scalars["Int"]>;
  offset?: InputMaybe<Scalars["Int"]>;
};

export type ReplaceJobInputType = {
  /** The body to send to the specified endpoint */
  body?: InputMaybe<Scalars["String"]>;
  /** Identifies if the job is currently enabled, defaults to TRUE */
  enabled?: InputMaybe<Scalars["Boolean"]>;
  /** The URL to request */
  endpoint: Scalars["String"];
  /** Optional headers to include with the request */
  headers?: InputMaybe<Array<HeaderInputType>>;
  /** The HTTP method to use when calling the endpoint */
  method?: InputMaybe<JobMethodEnum>;
  /** Specify a cosmetic name for the queue to help with searching and debugging */
  queue?: InputMaybe<Scalars["String"]>;
  /** If the job fails, how many times should it be retried? Defaults to 5. */
  retries?: InputMaybe<Scalars["Int"]>;
  /** A time in the future when this job should be run. If ommitted, defaults to immediately on receipt. You cannot specify `runAt` and `cron` at the same time */
  runAt?: InputMaybe<Scalars["DateTime"]>;
  /** Converts the Job to a recurring Job. Subsequent runs will occur this `duration` after every execution */
  runEvery?: InputMaybe<Scalars["Duration"]>;
};

export type Runner = Node &
  Stamped & {
    __typename?: "Runner";
    /** The date & time this was created */
    createdAt: Scalars["DateTime"];
    /** Any non-output errors captured during execution of the Job */
    errors?: Maybe<Scalars["String"]>;
    id: Scalars["ID"];
    /** The Job that owns this Runner */
    job: Job;
    /** The status of the Job Runner */
    status: RunnerStatusEnum;
    /** If a runner has executed, this contains the HTTP status code encountered */
    statusCode?: Maybe<Scalars["Int"]>;
    /** The truncated output from the page, capped to the first 1,000 characters */
    text?: Maybe<Scalars["String"]>;
    /** The date & time this was last updated */
    updatedAt: Scalars["DateTime"];
  };

/** The Job Runner's status */
export enum RunnerStatusEnum {
  Aborted = "ABORTED",
  Completed = "COMPLETED",
  Failed = "FAILED",
  Running = "RUNNING",
  Scheduled = "SCHEDULED",
}

/**
 * Describes an object that contains timestamp records for both
 * its creation and most recently updated values.
 */
export type Stamped = {
  /** The date & time this was created */
  createdAt: Scalars["DateTime"];
  /** The date & time this was last updated */
  updatedAt: Scalars["DateTime"];
};

export type UpdateJobInputType = {
  /** The body to send to the specified endpoint */
  body?: InputMaybe<Scalars["String"]>;
  /** Identifies if the job is currently enabled, defaults to TRUE */
  enabled?: InputMaybe<Scalars["Boolean"]>;
  /** The URL to request */
  endpoint?: InputMaybe<Scalars["String"]>;
  /** Optional headers to include with the request */
  headers?: InputMaybe<Array<HeaderInputType>>;
  /** The HTTP method to use when calling the endpoint */
  method?: InputMaybe<JobMethodEnum>;
  /** Specify a cosmetic name for the queue to help with searching and debugging */
  queue?: InputMaybe<Scalars["String"]>;
  /** If the job fails, how many times should it be retried? Defaults to 5. */
  retries?: InputMaybe<Scalars["Int"]>;
  /** A time in the future when this job should be run. If ommitted, defaults to immediately on receipt. You cannot specify `runAt` and `cron` at the same time */
  runAt?: InputMaybe<Scalars["DateTime"]>;
  /** Converts the Job to a recurring Job. Subsequent runs will occur this `duration` after every execution */
  runEvery?: InputMaybe<Scalars["Duration"]>;
};

export type JobDataFragment = {
  __typename: "Job";
  name: string;
  endpoint: string;
  headers?: any | null;
  enabled: boolean;
  body?: string | null;
  retries: number;
  runAt: any;
  runEvery?: any | null;
};

export type EnqueueJobMutationVariables = Exact<{
  name: Scalars["String"];
  job: ReplaceJobInputType;
}>;

export type EnqueueJobMutation = {
  __typename?: "Mutation";
  replaceJob: {
    __typename: "Job";
    name: string;
    endpoint: string;
    headers?: any | null;
    enabled: boolean;
    body?: string | null;
    retries: number;
    runAt: any;
    runEvery?: any | null;
  };
};

export type UpdateJobMutationVariables = Exact<{
  name: Scalars["String"];
  job: UpdateJobInputType;
}>;

export type UpdateJobMutation = {
  __typename?: "Mutation";
  updateJob: {
    __typename: "Job";
    name: string;
    endpoint: string;
    headers?: any | null;
    enabled: boolean;
    body?: string | null;
    retries: number;
    runAt: any;
    runEvery?: any | null;
  };
};

export type DeleteJobMutationVariables = Exact<{
  name: Scalars["String"];
}>;

export type DeleteJobMutation = {
  __typename?: "Mutation";
  deleteJob?: {
    __typename: "Job";
    name: string;
    endpoint: string;
    headers?: any | null;
    enabled: boolean;
    body?: string | null;
    retries: number;
    runAt: any;
    runEvery?: any | null;
  } | null;
};

export type GetJobByNameQueryVariables = Exact<{
  name: Scalars["String"];
}>;

export type GetJobByNameQuery = {
  __typename?: "Query";
  job?: {
    __typename: "Job";
    name: string;
    endpoint: string;
    headers?: any | null;
    enabled: boolean;
    body?: string | null;
    retries: number;
    runAt: any;
    runEvery?: any | null;
  } | null;
};

export const JobDataFragmentDoc = `
    fragment JobData on Job {
  __typename
  name
  endpoint
  headers
  enabled
  body
  retries
  runAt
  runEvery
}
    `;
export const EnqueueJobDocument = `
    mutation enqueueJob($name: String!, $job: ReplaceJobInputType!) {
  replaceJob(name: $name, job: $job) {
    ...JobData
  }
}
    ${JobDataFragmentDoc}`;
export const UpdateJobDocument = `
    mutation updateJob($name: String!, $job: UpdateJobInputType!) {
  updateJob(name: $name, job: $job) {
    ...JobData
  }
}
    ${JobDataFragmentDoc}`;
export const DeleteJobDocument = `
    mutation deleteJob($name: String!) {
  deleteJob(name: $name) {
    ...JobData
  }
}
    ${JobDataFragmentDoc}`;
export const GetJobByNameDocument = `
    query getJobByName($name: String!) {
  job(name: $name) {
    ...JobData
  }
}
    ${JobDataFragmentDoc}`;
export type Requester<C = {}> = <R, V>(
  doc: string,
  vars?: V,
  options?: C
) => Promise<R>;
export function getSdk<C>(requester: Requester<C>) {
  return {
    enqueueJob(
      variables: EnqueueJobMutationVariables,
      options?: C
    ): Promise<EnqueueJobMutation> {
      return requester<EnqueueJobMutation, EnqueueJobMutationVariables>(
        EnqueueJobDocument,
        variables,
        options
      );
    },
    updateJob(
      variables: UpdateJobMutationVariables,
      options?: C
    ): Promise<UpdateJobMutation> {
      return requester<UpdateJobMutation, UpdateJobMutationVariables>(
        UpdateJobDocument,
        variables,
        options
      );
    },
    deleteJob(
      variables: DeleteJobMutationVariables,
      options?: C
    ): Promise<DeleteJobMutation> {
      return requester<DeleteJobMutation, DeleteJobMutationVariables>(
        DeleteJobDocument,
        variables,
        options
      );
    },
    getJobByName(
      variables: GetJobByNameQueryVariables,
      options?: C
    ): Promise<GetJobByNameQuery> {
      return requester<GetJobByNameQuery, GetJobByNameQueryVariables>(
        GetJobByNameDocument,
        variables,
        options
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
