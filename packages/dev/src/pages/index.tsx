import type { NextPage } from "next";
import {
  MutationFunction,
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { Layout } from "components/Layout";
import { DataTable, Output } from "@taskless/ui";
import { DateTime, Duration } from "luxon";
import {
  FastForwardIcon,
  PlusIcon,
  ReplyIcon,
  XIcon,
} from "@heroicons/react/solid";
import React, { useCallback } from "react";
import { useBoolean } from "usehooks-ts";
import { GetJobsResponse } from "./api/rest/jobs";
import { PromoteJobResponse } from "./api/rest/job/[id]/promote";
import { ReplayJobResponse } from "./api/rest/job/[id]/replay";
import { CreateJobModal, Fields } from "components/Modals/CreateJob";
import Link from "next/link";
import { graphql } from "@taskless/types";
import { getClient, ClientError, RequestError } from "graphql/client";
import { Queue } from "@taskless/next";

const getJobs: QueryFunction<
  GetJobsResponse,
  ["jobs", { search: string }]
> = async ({ queryKey }) => {
  const [, { search }] = queryKey;
  const wl =
    typeof window === "undefined"
      ? "http://localhost:3001"
      : window.location.href;
  const u = new URL("/api/rest/jobs", wl);
  u.searchParams.append("q", search);
  const response = await fetch(u.toString());
  const result = await response.json();
  return result;
};

const promoteJob: MutationFunction<
  PromoteJobResponse,
  {
    id: string;
  }
> = async (args) => {
  const response = await fetch(`/api/rest/job/${args.id}/promote`, {
    method: "POST",
  });
  const result = await response.json();
  return result;
};

const replayJob: MutationFunction<
  ReplayJobResponse,
  {
    id: string;
  }
> = async (args) => {
  const response = await fetch(`/api/rest/job/${args.id}/replay`, {
    method: "POST",
  });
  const result = await response.json();
  return result;
};

const upsertJob: MutationFunction<
  graphql.EnqueueJobMutation,
  graphql.EnqueueJobMutationVariables
> = async (variables) => {
  const client = getClient();
  try {
    const response = await client.request<
      graphql.EnqueueJobMutation,
      graphql.EnqueueJobMutationVariables
    >(graphql.EnqueueJob, variables);
    return response;
  } catch (e) {
    console.error(e);
    if (e instanceof ClientError) {
      console.error(e.cause);
      console.error(e.stack);
    }
    if (e instanceof RequestError) {
      console.error(e.original);
    }

    throw e;
  }
};

/** Get run data (next and last) from a record */
const extractRunData = (row: GetJobsResponse["jobs"][0]) => {
  const now = DateTime.now();
  const runAt = DateTime.fromJSDate(new Date(row.runAt));
  const nextRun = runAt > now ? runAt.toLocal() : undefined;
  const lastRunAt = row.summary?.lastRun ?? null;
  const lastRun = lastRunAt
    ? DateTime.fromJSDate(new Date(lastRunAt)).toLocal()
    : undefined;

  return {
    next: nextRun,
    last: lastRun,
  };
};

const Home: NextPage = () => {
  const {
    value: showCreate,
    setTrue: openCreateModal,
    setFalse: closeCreateModal,
  } = useBoolean(false);

  const qc = useQueryClient();
  const { data } = useQuery(["jobs", { search: "" }], getJobs, {
    // refetchInterval: 5000,
  });

  const { mutate: promote } = useMutation(promoteJob, {
    onSuccess: () => {
      void qc.invalidateQueries("jobs");
    },
  });

  const { mutate: replay } = useMutation(replayJob, {
    onSuccess: () => {
      void qc.invalidateQueries("jobs");
    },
  });

  const { mutate: upsert } = useMutation(upsertJob, {
    onSuccess: () => {
      void qc.invalidateQueries("jobs");
    },
  });

  const createJob = useCallback(
    (d: Fields) => {
      console.log(d);
      const h = d.headers ? JSON.parse(d.headers) : {};
      // object => gql-like
      const headers = Object.keys(h).map((hd) => ({
        name: hd,
        value: `${h?.[hd as keyof typeof h]}`,
      }));

      const undefString = (s: unknown): string | undefined => {
        if (typeof s === "string" && s.length > 0) {
          return s;
        }
        return undefined;
      };

      upsert({
        name: d.name,
        job: {
          endpoint: d.endpoint,
          runAt: undefString(d.runAt),
          runEvery: undefString(d.runEvery),
          retries: parseInt(d.retries, 10),
          headers,
          body: JSON.stringify(Queue.wrapPayload(JSON.parse(d.body ?? ""))),
        },
      });

      closeCreateModal();
    },
    [upsert, closeCreateModal]
  );

  return (
    <Layout title="Jobs - Taskless Development Server">
      <div className="flex flex-row gap-3 pb-3">
        <div className="relative flex w-full flex-row">{/* Search */}</div>
        <button
          className="bg-primary-700 hover:bg-primary-500 flex flex-shrink-0 flex-row items-center gap-3 rounded-md px-3 py-2 text-white transition"
          onClick={openCreateModal}
        >
          <PlusIcon className="h-5 w-5" />
          Create a Job
        </button>
        <CreateJobModal
          show={showCreate}
          onRequestClose={closeCreateModal}
          onRequestConfirm={createJob}
        />
      </div>
      <div className="rounded bg-white p-3 shadow-lg">
        <div className="flex flex-row items-center gap-3">
          <h2 className="flex-grow text-ellipsis pb-1 text-xl font-medium">
            All Jobs
          </h2>
        </div>
        <DataTable<GetJobsResponse["jobs"][0]>
          data={data?.jobs ?? []}
          columns={[
            {
              name: "Name",
              renderValue: ({ record }) => {
                return (
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    <span>{record.name}</span>
                  </div>
                );
              },
            },
            {
              name: "Next Run",
              renderValue: ({ record }) => {
                const run = extractRunData(record);
                return (
                  <div className="flex flex-row items-center">
                    <span title={run.next ? run.next.toISO() : undefined}>
                      {run.next ? run.next.toRelative() : "-"}
                    </span>
                    {run.next ? (
                      <button
                        title="Run now"
                        className="ml-2"
                        onClick={() => promote({ id: record.id })}
                      >
                        <FastForwardIcon className="hover:fill-primary-300 h-3 w-3 fill-gray-500 transition" />
                      </button>
                    ) : null}
                  </div>
                );
              },
            },
            {
              name: "Last Run",
              renderValue: ({ record }) => {
                const run = extractRunData(record);
                return (
                  <div className="flex flex-row items-center">
                    <span title={run.last ? run.last.toISO() : undefined}>
                      {run.last ? run.last.toRelative() : "-"}
                    </span>
                    {run.last ? (
                      <button
                        title="Replay Job"
                        className="ml-2"
                        onClick={() => replay({ id: record.id })}
                      >
                        <ReplyIcon className="hover:fill-primary-300 h-3 w-3 fill-gray-500 transition" />
                      </button>
                    ) : null}
                  </div>
                );
              },
            },
            {
              name: "Last Status",
              renderValue: ({ record }) => (
                <>
                  {typeof record.summary?.lastStatus === "undefined"
                    ? "-"
                    : record.summary?.lastStatus
                    ? "COMPLETED"
                    : "FAILED"}
                </>
              ),
            },
          ]}
          hasDetailsColumn
          detailsButtonClassName="text-sm text-gray-500"
          renderDetails={({ record, close }) => (
            <div className="relative ml-6 mb-3 flex flex-col rounded bg-gray-100 px-3 pb-3 pt-2">
              <button
                className="absolute top-3 self-start self-end text-gray-600 transition hover:text-gray-900"
                onClick={() => close()}
              >
                <XIcon className="h-3 w-3" />
              </button>
              <div className="pb-6">
                <h4 className="flex-grow text-lg font-medium">Details</h4>
                <div className="flex flex-row flex-wrap gap-3 text-sm lg:gap-6">
                  <div className="flex w-full flex-col md:w-1/3 lg:w-1/4">
                    <div className="font-semibold">Enabled</div>
                    <div className="overflow-hidden text-ellipsis text-xs">
                      {record.enabled ? "TRUE" : "FALSE"}
                    </div>
                  </div>

                  <div className="flex w-full flex-col md:w-1/3 lg:w-1/4">
                    <div className="font-semibold">Endpoint</div>
                    <div className="overflow-hidden text-ellipsis text-xs">
                      {record.endpoint}
                    </div>
                  </div>

                  <div className="flex w-full flex-col md:w-1/3 lg:w-1/4">
                    <div className="font-semibold">Next Run</div>
                    <div
                      className="flex flex-row items-center overflow-hidden text-ellipsis text-xs"
                      title={
                        extractRunData(record).next?.toUTC().toISO() ?? "-"
                      }
                    >
                      {extractRunData(record).next?.toLocal().toISO() ?? "-"}
                      {extractRunData(record).next ? (
                        <button
                          title="Run now"
                          className="ml-2"
                          onClick={() => promote({ id: record.id })}
                        >
                          <FastForwardIcon className="hover:fill-primary-300 h-3 w-3 fill-gray-800 transition" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex w-full flex-col md:w-1/3 lg:w-1/4">
                    <div className="font-semibold">Run Every</div>
                    <div
                      className="overflow-hidden text-ellipsis text-xs"
                      title={
                        record.runEvery
                          ? Duration.fromISO(record.runEvery).toISO()
                          : "-"
                      }
                    >
                      {record.runEvery
                        ? Duration.fromISO(record.runEvery).toHuman()
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col pt-3 text-sm lg:pt-6">
                <span className="font-mono text-sm font-bold text-gray-700">
                  Headers
                </span>
                <Output
                  className="max-w-none overflow-x-scroll bg-gray-800 p-3 text-xs text-white rounded"
                  output={record.headers}
                />
              </div>

              <div className="flex w-full flex-col pt-3 text-sm lg:pt-6">
                <span className="font-mono text-sm font-bold text-gray-700">
                  Body
                </span>
                <Output
                  className="max-w-none overflow-x-scroll bg-gray-800 p-3 text-xs text-white rounded"
                  output={record.body ?? undefined}
                />
              </div>

              <div className="pt-6 text-sm">
                <Link
                  href={`/logs?${new URLSearchParams({
                    q: `jobId:${record.id}`,
                  }).toString()}`}
                >
                  <a className="hover:text-primary-700 hover:decoration-primary-700 text-gray-700 underline decoration-gray-700 transition">
                    View Logs
                  </a>
                </Link>
              </div>
            </div>
          )}
        />
      </div>
    </Layout>
  );
};

export default Home;
