import type { NextPage } from "next";
import {
  MutationFunction,
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { Layout } from "components/Layout";
import { DataTable } from "@taskless/ui";
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
import { UpsertJobResponse, UpsertJobVariables } from "./api/rest/job/upsert";
import { CreateJobModal, Fields } from "components/Modals/CreateJob";
import Link from "next/link";

const getJobs: QueryFunction<
  GetJobsResponse,
  ["jobs", { search: string }]
> = async ({ queryKey }) => {
  const [_key, { search }] = queryKey;
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
  UpsertJobResponse,
  UpsertJobVariables
> = async (args) => {
  const response = await fetch(`/api/rest/job/upsert`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const result = await response.json();
  return result;
};

/** Get run data (next and last) from a record */
const extractRunData = (row: GetJobsResponse["jobs"][0]) => {
  const now = DateTime.now();
  const lastRunner = row.logs?.[0] ?? null;

  const runAt = row.schedule?.next
    ? DateTime.fromJSDate(new Date(row.schedule.next))
    : null;
  const nextRun = runAt && runAt > now ? runAt.toLocal() : undefined;
  const lastRun = lastRunner?.createdAt
    ? DateTime.fromJSDate(new Date(lastRunner.createdAt)).toLocal()
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
    refetchInterval: 5000,
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
      const h = d.headers ? JSON.parse(d.headers) : {};
      // object => gql-like
      const headers = Object.keys(h).map((hd) => ({
        name: hd,
        value: `${h?.[hd as keyof typeof h]}`,
      }));

      console.log(d);

      upsert({
        name: d.name,
        __meta: {
          appId: d.appId ?? undefined,
          queueName: d.queueName ?? undefined,
          secret: d.appSecret ?? undefined,
        },
        job: {
          endpoint: d.endpoint,
          enabled: d.enabled,
          runAt: d.runAt,
          runEvery: d.runEvery,
          headers,
          body: d.body,
        },
      });

      closeCreateModal();
    },
    [upsert, closeCreateModal]
  );

  return (
    <Layout title="Jobs - Taskless Development Server">
      <div className="flex flex-row gap-3 pb-3">
        <div className="w-full relative flex flex-row">{/* Search */}</div>
        <button
          className="flex-shrink-0 bg-primary-700 text-white px-3 py-2 rounded-md flex flex-row items-center gap-3 hover:bg-primary-500 transition"
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
      <div className="bg-white shadow-lg rounded p-3">
        <div className="flex flex-row items-center gap-3">
          <h2 className="text-xl font-medium pb-1 text-ellipsis flex-grow">
            All Jobs
          </h2>
        </div>
        <DataTable<GetJobsResponse["jobs"][0]>
          data={data?.jobs ?? []}
          columns={[
            {
              name: "Name",
              renderValue: ({ data: row }) => {
                return (
                  <div>
                    <span className="truncate">{row.name}</span>
                  </div>
                );
              },
            },
            {
              name: "Next Run",
              renderValue: ({ data: row }) => {
                const run = extractRunData(row);
                return (
                  <div className="flex flex-row items-center">
                    <span title={run.next ? run.next.toISO() : undefined}>
                      {run.next ? run.next.toRelative() : "-"}
                    </span>
                    {run.next ? (
                      <button
                        title="Run now"
                        className="ml-2"
                        onClick={() => promote({ id: row.id.toString() })}
                      >
                        <FastForwardIcon className="h-3 w-3 fill-gray-500 hover:fill-primary-300 transition" />
                      </button>
                    ) : null}
                  </div>
                );
              },
            },
            {
              name: "Last Run",
              renderValue: ({ data: row }) => {
                const run = extractRunData(row);
                return (
                  <div className="flex flex-row items-center">
                    <span title={run.last ? run.last.toISO() : undefined}>
                      {run.last ? run.last.toRelative() : "-"}
                    </span>
                    {run.last ? (
                      <button
                        title="Replay Job"
                        className="ml-2"
                        onClick={() => replay({ id: row.id.toString() })}
                      >
                        <ReplyIcon className="h-3 w-3 fill-gray-500 hover:fill-primary-300 transition" />
                      </button>
                    ) : null}
                  </div>
                );
              },
            },
            {
              name: "Last Status",
              renderValue: ({ data: row }) => (
                <>{row.logs?.[0]?.status ?? "-"}</>
              ),
            },
          ]}
          hasDetailsColumn
          detailsButtonClassName="text-sm text-gray-500"
          renderDetails={({ data: row, close }) => (
            <div className="ml-6 mb-3 px-3 pb-3 pt-2 bg-gray-100 flex flex-col rounded relative">
              <button
                className="self-end text-gray-600 hover:text-gray-900 transition self-start absolute top-3"
                onClick={() => close()}
              >
                <XIcon className="w-3 h-3" />
              </button>
              <div className="pb-6">
                <h4 className="text-lg font-medium flex-grow">Details</h4>
                <div className="flex flex-row flex-wrap gap-3 lg:gap-6 text-sm">
                  <div className="flex flex-col w-full md:w-1/3 lg:w-1/4">
                    <div className="font-semibold">Enabled</div>
                    <div className="text-xs overflow-hidden text-ellipsis">
                      {row.enabled ? "TRUE" : "FALSE"}
                    </div>
                  </div>

                  <div className="flex flex-col w-full md:w-1/3 lg:w-1/4">
                    <div className="font-semibold">Endpoint</div>
                    <div className="text-xs overflow-hidden text-ellipsis">
                      {row.endpoint}
                    </div>
                  </div>

                  <div className="flex flex-col w-full md:w-1/3 lg:w-1/4">
                    <div className="font-semibold">Next Run</div>
                    <div
                      className="text-xs overflow-hidden text-ellipsis flex flex-row items-center"
                      title={extractRunData(row).next?.toUTC().toISO() ?? "-"}
                    >
                      {extractRunData(row).next?.toLocal().toISO() ?? "-"}
                      {extractRunData(row).next ? (
                        <button
                          title="Run now"
                          className="ml-2"
                          onClick={() => promote({ id: row.id.toString() })}
                        >
                          <FastForwardIcon className="h-3 w-3 fill-gray-800 hover:fill-primary-300 transition" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col w-full md:w-1/3 lg:w-1/4">
                    <div className="font-semibold">Run Every</div>
                    <div
                      className="text-xs overflow-hidden text-ellipsis"
                      title={
                        row.runEvery
                          ? Duration.fromISO(row.runEvery).toISO()
                          : "-"
                      }
                    >
                      {row.runEvery
                        ? Duration.fromISO(row.runEvery).toHuman()
                        : "-"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full text-sm pt-3 lg:pt-6">
                <span className="text-sm font-bold font-mono text-gray-700">
                  Headers
                </span>
                <pre className="text-xs max-w-none overflow-x-scroll p-3 bg-gray-800 text-white">
                  {JSON.stringify(row.headers ?? {}, null, 2)}
                </pre>
              </div>

              <div className="flex flex-col w-full text-sm pt-3 lg:pt-6">
                <span className="text-sm font-bold font-mono text-gray-700">
                  Body
                </span>
                <pre className="text-xs max-w-none overflow-x-scroll p-3 bg-gray-800 text-white">
                  {row.body
                    ? JSON.stringify(
                        JSON.parse(row.body as string) ?? {},
                        null,
                        2
                      )
                    : ""}
                </pre>
              </div>

              <div className="pt-6 text-sm">
                <Link
                  href={`/logs?${new URLSearchParams({
                    q: `jobId:${row.v5id}`,
                  }).toString()}`}
                >
                  <a className="underline text-gray-700 decoration-gray-700 hover:text-primary-700 hover:decoration-primary-700 transition">
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
