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
  DateTime: any;
  /**
   *
   *     A string representing a duration conforming to the ISO8601 standard,
   *     such as: P1W1DT13H23M34S
   *     P is the duration designator (for period) placed at the start of the duration representation.
   *     Y is the year designator that follows the value for the number of years.
   *     M is the month designator that follows the value for the number of months.
   *     W is the week designator that follows the value for the number of weeks.
   *     D is the day designator that follows the value for the number of days.
   *     T is the time designator that precedes the time components of the representation.
   *     H is the hour designator that follows the value for the number of hours.
   *     M is the minute designator that follows the value for the number of minutes.
   *     S is the second designator that follows the value for the number of seconds.
   *
   *     Note the time designator, T, that precedes the time value.
   *
   *     Matches moment.js, Luxon and DateFns implementations
   *     ,/. is valid for decimal places and +/- is a valid prefix
   *
   */
  Duration: any;
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
   * or (2) A 6-value cron interval in the format of ss mm hh d M W
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
  Interval: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /**
   * An IANA approved time zone such as from the list at https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
   * and in the format of either "X" or "X/Y" depending on the tz database zone identifier.
   */
  Timezone: any;
  /** A field whose value is a generic Universally Unique Identifier: https://en.wikipedia.org/wiki/Universally_unique_identifier. */
  UUID: any;
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
  /** Specify a time zone when scheduling recurrence of the job. Subsequent runs after the first `runAt` will use this value when calculating the next execution. A value of `null` strips time zone information from the recurrence */
  timezone?: InputMaybe<Scalars['Timezone']>;
};

/** A header key/value pair */
export type HeaderInputType = {
  /** The header's name */
  name: Scalars['String'];
  /** The header's value */
  value: Scalars['String'];
};

/**
 * Describes a Taskless Job. Job names are unique to the queue and
 * specify both the requested time for their first inovcation and timestamps
 * for subsequent runs. In addition to a name, Jobs are given a unique ID
 * that is a UUID v5 identifier of the Job's name, with the internal UUID of the
 * Queue as the namespace.
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
  /** The common name for the Job, unique to the queue */
  name: Scalars['String'];
  /** The Queue that owns this Job */
  queue?: Maybe<Queue>;
  /** The ID of the associated Queue object */
  queueId: Scalars['UUID'];
  /** The number of attempts that will be made before the job run is marked as FAILED */
  retries: Scalars['Int'];
  /** When in the future this Job should first be run */
  runAt: Scalars['DateTime'];
  /**
   * Make the Job recurring by waiting this amount of time between
   * invocations. Time is defined as a standard ISO-8601 duration
   */
  runEvery?: Maybe<Scalars['Interval']>;
  /** The timezone used for calculating subsequent runs when recurrence is enabled */
  timezone?: Maybe<Scalars['Timezone']>;
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
   * Create a new job, or replace an existing job. Taskless jobs call
   * the provided endpoint at the requested time. Options can be
   * provided for run frequency, as well as headers and the postable
   * http body.
   */
  enqueueJob: Job;
};


export type MutationCancelJobArgs = {
  name: Scalars['String'];
};


export type MutationEnqueueJobArgs = {
  job: EnqueueJobInputType;
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
  /** Retrieve the queue information, either by id or name */
  queue?: Maybe<Queue>;
  /**
   * Retrieve information about the currently authenticated account. May
   * also be used as an echo / verification that your credentials are
   * working as expected.
   */
  whoami?: Maybe<WhoAmI>;
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
  name?: InputMaybe<Scalars['UUID']>;
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

export type WhoAmI = {
  __typename?: 'WhoAmI';
  /** A list of roles allowed by the current credentials */
  allowedRoles: Array<Maybe<Scalars['String']>>;
  /** The currently identified project, if applicable */
  project?: Maybe<Scalars['UUID']>;
  /** The currently identified queue, if applicable */
  queue?: Maybe<Scalars['UUID']>;
  /** The role currently being used by the request */
  role?: Maybe<Scalars['String']>;
};

export type EnqueueJobMutationVariables = Exact<{
  name: Scalars['String'];
  job: EnqueueJobInputType;
}>;


export type EnqueueJobMutation = { __typename?: 'Mutation', enqueueJob: { __typename?: 'Job', id: string, name: string, enabled: boolean, endpoint: string, headers?: any | null, body?: string | null, retries: number, runAt: any, runEvery?: any | null, timezone?: any | null } };

export type CancelJobMutationVariables = Exact<{
  name: Scalars['String'];
}>;


export type CancelJobMutation = { __typename?: 'Mutation', cancelJob?: { __typename?: 'Job', id: string, name: string, enabled: boolean, endpoint: string, headers?: any | null, body?: string | null, retries: number, runAt: any, runEvery?: any | null, timezone?: any | null } | null };


export const EnqueueJob = `
    mutation enqueueJob($name: String!, $job: EnqueueJobInputType!) {
  enqueueJob(name: $name, job: $job) {
    id
    name
    enabled
    endpoint
    headers
    body
    retries
    runAt
    runEvery
    timezone
  }
}
    `;
export const CancelJob = `
    mutation cancelJob($name: String!) {
  cancelJob(name: $name) {
    id
    name
    enabled
    endpoint
    headers
    body
    retries
    runAt
    runEvery
    timezone
  }
}
    `;