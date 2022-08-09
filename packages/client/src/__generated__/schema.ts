export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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
  DateTime: string;
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
  Duration: string;
  /**
   * Represents one of the following:
   *
   * (1) A string representing a duration conforming to the ISO8601 standard,
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
   *
   * (2) A 6-value cron interval in the format of ss mm hh d M W
   * such as: 0 0 * * 1L
   * ss is the seconds designator for the crontab entry 0-59
   * mm is the minutes designator for the crontab entry 0-59
   * hh is the hours designator for the crontab entry 0-24
   * d is the day-of-month designator for the crontab entry 0-31
   * M is the month designator for the crontab entry 0-12
   * W is the weekday designator for the crontab entry 0-7 with Sunday being either 0 or 7
   *
   * Supports both "/" syntax such as "* *\/2 * * * *" for every 2 minutes and
   * "L" syntax such as "0 0 * * * 1L" for the last Monday of the month at midnight.
   */
  Interval: string;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: unknown;
  /** A field whose value is a generic Universally Unique Identifier: https://en.wikipedia.org/wiki/Universally_unique_identifier. */
  UUID: string;
};

export type CreateJobInputType = {
  /** The body to send to the specified endpoint */
  body?: InputMaybe<Scalars['String']>;
  /** The URL to request */
  endpoint: Scalars['String'];
  /** Optional headers to include with the request */
  headers?: InputMaybe<Array<HeaderInputType>>;
  /** The HTTP method to use when calling the endpoint */
  method?: InputMaybe<JobMethodEnum>;
  /** Specify a cosmetic name for the queue to help with searching and debugging */
  queue?: InputMaybe<Scalars['String']>;
  /** If the job fails, how many times should it be retried? Defaults to 5. */
  retries?: InputMaybe<Scalars['Int']>;
  /** A time in the future when this job should be run. If ommitted, defaults to immediately on receipt. You cannot specify `runAt` and `cron` at the same time */
  runAt?: InputMaybe<Scalars['DateTime']>;
  /** Converts the Job to a recurring Job. Subsequent runs will occur this `duration` after every execution */
  runEvery?: InputMaybe<Scalars['Duration']>;
};

export type EnqueueJobInputType = {
  /** The body to send to the specified endpoint */
  body?: InputMaybe<Scalars['String']>;
  /** The URL to request */
  endpoint: Scalars['String'];
  /** Optional headers to include with the request */
  headers?: InputMaybe<Array<HeaderInputType>>;
  /** The HTTP method to use when calling the endpoint */
  method?: InputMaybe<JobMethodEnum>;
  /** If the job fails, how many times should it be retried? Defaults to 5. */
  retries?: InputMaybe<Scalars['Int']>;
  /** A time in the future when this job should be run. If ommitted, defaults to immediately on receipt. */
  runAt?: InputMaybe<Scalars['DateTime']>;
  /** Converts the Job to a recurring Job. Subsequent runs after the first `runAt` will occur this `duration` after every execution */
  runEvery?: InputMaybe<Scalars['Interval']>;
};

/** A header key/value pair */
export type HeaderInputType = {
  /** The header's name */
  name: Scalars['String'];
  /** The header's value */
  value: Scalars['String'];
};

/**
 * Describes a Taskless Job. Job names are unique to the application and
 * specify both the requested time for their first inovcation and timestamps
 * for subsequent runs. In addition to a name, Jobs are given a unique ID
 * that is a UUID v5 identifier of the Job's name, with the UUID of the
 * Application as the namespace.
 */
export type Job = Node & Stamped & {
  __typename?: 'Job';
  /** Optional body content to include with the request */
  body?: Maybe<Scalars['String']>;
  /** The date & time this was created */
  createdAt: Scalars['DateTime'];
  /** Describes if the job is currently enabled */
  enabled: Scalars['Boolean'];
  /** The URL to call when this Job runs */
  endpoint: Scalars['String'];
  /** Optional key/value pairs to be sent as headers to the endpoint */
  headers?: Maybe<Scalars['JSON']>;
  id: Scalars['ID'];
  /** The HTTP method to use when calling this endpoint */
  method: JobMethodEnum;
  /** The common name for the Job, unique to the application */
  name: Scalars['String'];
  /** The Queue that owns this Job */
  queue?: Maybe<Queue>;
  /** The number of attempts that will be made before the job run is marked as FAILED */
  retries: Scalars['Int'];
  /** When in the future this Job should first be run */
  runAt: Scalars['DateTime'];
  /**
   * Make the Job recurring by waiting this amount of time between
   * invocations. Time is defined as a standard ISO-8601 duration
   */
  runEvery?: Maybe<Scalars['Interval']>;
  /** The date & time this was last updated */
  updatedAt: Scalars['DateTime'];
};

/** Valid HTTP methods for Taskless Jobs */
export enum JobMethodEnum {
  Get = 'GET',
  Post = 'POST'
}

export type Mutation = {
  __typename?: 'Mutation';
  /**
   * Cancels any upcoming runs of the requested job, returning either the
   * modified job or `null` if no job was found with the requested name.
   */
  cancelJob?: Maybe<Job>;
  /**
   * Create a new Job, which will call the specified endpoint at the
   * requested time. Options can be orovided for run frequency, as well
   * as headers and postable body. Will error if a Job already exists
   * with the requested name. If you would like to upsert the result,
   * instead use CreateOrUpdateJob.
   * @deprecated Please use enqueueJob() instead
   */
  createJob: Job;
  /**
   * Delete a job by its specified name. Returns null if no matching job was deleted.
   * @deprecated Please use removeJob() instead
   */
  deleteJob?: Maybe<Job>;
  /**
   * Create a new job, or replace an existing job. Taskless jobs call
   * the provided endpoint at the requested time. Options can be
   * provided for run frequency, as well as headers and the postable
   * http body.
   */
  enqueueJob: Job;
  /**
   * Creates a job with the included unique name for the Application. If a
   * Job already exists with the requested name, this operation will instead
   * update the existing Job with the new values.
   * @deprecated Please use enqueueJob() instead
   */
  replaceJob: Job;
  /**
   * Updates a Job by the specified name. Will error if a job does not
   * exist inside of the Application with the requested name.
   * @deprecated Please use enqueueJob() instead
   */
  updateJob: Job;
};


export type MutationCancelJobArgs = {
  name: Scalars['String'];
};


export type MutationCreateJobArgs = {
  job: CreateJobInputType;
  name: Scalars['String'];
};


export type MutationDeleteJobArgs = {
  name: Scalars['String'];
};


export type MutationEnqueueJobArgs = {
  job: EnqueueJobInputType;
  name: Scalars['String'];
};


export type MutationReplaceJobArgs = {
  job: ReplaceJobInputType;
  name: Scalars['String'];
};


export type MutationUpdateJobArgs = {
  job: UpdateJobInputType;
  name: Scalars['String'];
};

/**
 * Describes an object that is uniquely identifiable by a
 * unique ID record
 */
export type Node = {
  id: Scalars['ID'];
};

/** The ordering operation for this column */
export enum OrderByEnum {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Retrieve a Job by its common name. */
  job?: Maybe<Job>;
  /** Return a list of jobs */
  jobs?: Maybe<Array<Maybe<Job>>>;
  /**
   * Retrieve the queue information. With no arguments, retrieves
   * the current queue's details
   */
  queue?: Maybe<Queue>;
};


export type QueryJobArgs = {
  name: Scalars['String'];
};


export type QueryJobsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};


export type QueryQueueArgs = {
  id?: InputMaybe<Scalars['UUID']>;
};

export type Queue = Node & Stamped & {
  __typename?: 'Queue';
  /** The date & time this was created */
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  /** A list of jobs for this queue */
  jobs?: Maybe<Array<Maybe<Job>>>;
  /** The common name for the Queue */
  name: Scalars['String'];
  /** The date & time this was last updated */
  updatedAt: Scalars['DateTime'];
};


export type QueueJobsArgs = {
  limit?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
};

export type ReplaceJobInputType = {
  /** The body to send to the specified endpoint */
  body?: InputMaybe<Scalars['String']>;
  /** The URL to request */
  endpoint: Scalars['String'];
  /** Optional headers to include with the request */
  headers?: InputMaybe<Array<HeaderInputType>>;
  /** The HTTP method to use when calling the endpoint */
  method?: InputMaybe<JobMethodEnum>;
  /** Specify a cosmetic name for the queue to help with searching and debugging */
  queue?: InputMaybe<Scalars['String']>;
  /** If the job fails, how many times should it be retried? Defaults to 5. */
  retries?: InputMaybe<Scalars['Int']>;
  /** A time in the future when this job should be run. If ommitted, defaults to immediately on receipt. You cannot specify `runAt` and `cron` at the same time */
  runAt?: InputMaybe<Scalars['DateTime']>;
  /** Converts the Job to a recurring Job. Subsequent runs will occur this `duration` after every execution */
  runEvery?: InputMaybe<Scalars['Duration']>;
};

/**
 * Describes an object that contains timestamp records for both
 * its creation and most recently updated values.
 */
export type Stamped = {
  /** The date & time this was created */
  createdAt: Scalars['DateTime'];
  /** The date & time this was last updated */
  updatedAt: Scalars['DateTime'];
};

export type UpdateJobInputType = {
  /** The body to send to the specified endpoint */
  body?: InputMaybe<Scalars['String']>;
  /** The URL to request */
  endpoint?: InputMaybe<Scalars['String']>;
  /** Optional headers to include with the request */
  headers?: InputMaybe<Array<HeaderInputType>>;
  /** The HTTP method to use when calling the endpoint */
  method?: InputMaybe<JobMethodEnum>;
  /** Specify a cosmetic name for the queue to help with searching and debugging */
  queue?: InputMaybe<Scalars['String']>;
  /** If the job fails, how many times should it be retried? Defaults to 5. */
  retries?: InputMaybe<Scalars['Int']>;
  /** A time in the future when this job should be run. If ommitted, defaults to immediately on receipt. You cannot specify `runAt` and `cron` at the same time */
  runAt?: InputMaybe<Scalars['DateTime']>;
  /** Converts the Job to a recurring Job. Subsequent runs will occur this `duration` after every execution */
  runEvery?: InputMaybe<Scalars['Duration']>;
};

export type JobDataFragment = { __typename: 'Job', name: string, endpoint: string, headers?: unknown | null, enabled: boolean, body?: string | null, retries: number, runAt: string, runEvery?: string | null };

export type EnqueueJobMutationVariables = Exact<{
  name: Scalars['String'];
  job: EnqueueJobInputType;
}>;


export type EnqueueJobMutation = { __typename?: 'Mutation', enqueueJob: { __typename: 'Job', name: string, endpoint: string, headers?: unknown | null, enabled: boolean, body?: string | null, retries: number, runAt: string, runEvery?: string | null } };

export type CancelJobMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CancelJobMutation = { __typename?: 'Mutation', cancelJob?: { __typename: 'Job', name: string, endpoint: string, headers?: unknown | null, enabled: boolean, body?: string | null, retries: number, runAt: string, runEvery?: string | null } | null };

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
    mutation enqueueJob($name: String!, $job: EnqueueJobInputType!) {
  enqueueJob(name: $name, job: $job) {
    ...JobData
  }
}
    ${JobDataFragmentDoc}`;
export const CancelJobDocument = `
    mutation cancelJob($name: String!) {
  cancelJob(name: $name) {
    ...JobData
  }
}
    ${JobDataFragmentDoc}`;
export type Requester<C= {}> = <R, V>(doc: string, vars?: V, options?: C) => Promise<R>
export function getSdk<C>(requester: Requester<C>) {
  return {
    enqueueJob(variables: EnqueueJobMutationVariables, options?: C): Promise<EnqueueJobMutation> {
      return requester<EnqueueJobMutation, EnqueueJobMutationVariables>(EnqueueJobDocument, variables, options);
    },
    cancelJob(variables: CancelJobMutationVariables, options?: C): Promise<CancelJobMutation> {
      return requester<CancelJobMutation, CancelJobMutationVariables>(CancelJobDocument, variables, options);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;