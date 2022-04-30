import type { NextPage } from "next";
import {
  MutationFunction,
  QueryFunction,
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { Layout } from "components/Layout";
import { DataTable } from "components/shared/DataTable";
import { DateTime, Duration } from "luxon";
import { FastForwardIcon, ReplyIcon, XIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { GetJobsResponse } from "./api/rest/jobs";
import { useCallback } from "react";
import { PromoteJobResponse } from "./api/rest/job/[id]/promote";
import { ReplayJobResponse } from "./api/rest/job/[id]/replay";

type promoteJobMutationVariables = {
  id: string;
};
const promoteJob: MutationFunction<
  PromoteJobResponse,
  promoteJobMutationVariables
> = async (args) => {
  const response = await fetch(`/api/rest/job/${args.id}/promote`, {
    method: "POST",
  });
  const result = await response.json();
  return result;
};

type replayJobMutationVariables = {
  id: string;
};
const replayJob: MutationFunction<
  ReplayJobResponse,
  replayJobMutationVariables
> = async (args) => {
  const response = await fetch(`/api/rest/job/${args.id}/replay`, {
    method: "POST",
  });
  const result = await response.json();
  return result;
};

type getJobsVariables = [QueryKey, { filters: any }];
const getJobs: QueryFunction<GetJobsResponse, getJobsVariables> = async ({
  queryKey,
}) => {
  const [_key, { filters }] = queryKey;
  const sp = filters
    ? "?" +
      new URLSearchParams({
        filters: JSON.stringify(filters),
      }).toString()
    : "";

  const response = await fetch("/api/rest/jobs" + sp);
  const result = await response.json();
  return result;
};

/** Get run data (next and last) from a record */
const extractRunData = (row: GetJobsResponse["jobs"][0]) => {
  const now = DateTime.local();
  const lastRunner = row.lastLog ?? null;

  const runAt = row.schedule.next
    ? DateTime.fromMillis(row.schedule.next)
    : null;
  const nextRun = runAt && runAt > now ? runAt.toLocal() : undefined;
  const lastRun = lastRunner
    ? DateTime.fromMillis(lastRunner.createdAt).toLocal()
    : undefined;

  return {
    next: nextRun,
    last: lastRun,
  };
};

const Home: NextPage = () => {
  const qc = useQueryClient();
  const { data } = useQuery<
    GetJobsResponse,
    unknown,
    GetJobsResponse,
    getJobsVariables
  >(["jobs", { filters: null }], getJobs, {
    refetchInterval: 5000,
  });

  const { mutate: promote } = useMutation(promoteJob, {
    onSuccess: () => {
      qc.invalidateQueries("jobs");
    },
  });

  const { mutate: replay } = useMutation(replayJob, {
    onSuccess: () => {
      qc.invalidateQueries("jobs");
    },
  });

  return (
    <Layout title="Jobs - Taskless Development Server">
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
                    <span className="truncate">{row.data.name}</span>
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
                        onClick={() => promote({ id: row._id })}
                      >
                        <FastForwardIcon className="h-3 w-3 fill-gray-500 hover:fill-brand-300 transition" />
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
                        onClick={() => replay({ id: row._id })}
                      >
                        <ReplyIcon className="h-3 w-3 fill-gray-500 hover:fill-brand-300 transition" />
                      </button>
                    ) : null}
                  </div>
                );
              },
            },
            {
              name: "Last Status",
              renderValue: ({ data: row }) => (
                <>{row.lastLog?.data.status ?? "-"}</>
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
                      {row.data.enabled ? "TRUE" : "FALSE"}
                    </div>
                  </div>

                  <div className="flex flex-col w-full md:w-1/3 lg:w-1/4">
                    <div className="font-semibold">Endpoint</div>
                    <div className="text-xs overflow-hidden text-ellipsis">
                      {row.data.endpoint}
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
                          onClick={() => promote({ id: row._id })}
                        >
                          <FastForwardIcon className="h-3 w-3 fill-gray-800 hover:fill-brand-300 transition" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col w-full md:w-1/3 lg:w-1/4">
                    <div className="font-semibold">Run Every</div>
                    <div
                      className="text-xs overflow-hidden text-ellipsis"
                      title={
                        row.data.runEvery
                          ? Duration.fromISO(row.data.runEvery).toISO()
                          : "-"
                      }
                    >
                      {row.data.runEvery
                        ? Duration.fromISO(row.data.runEvery).toHuman()
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
                  {JSON.stringify(row.data.headers ?? {}, null, 2)}
                </pre>
              </div>

              <div className="flex flex-col w-full text-sm pt-3 lg:pt-6">
                <span className="text-sm font-bold font-mono text-gray-700">
                  Body
                </span>
                <pre className="text-xs max-w-none overflow-x-scroll p-3 bg-gray-800 text-white">
                  {JSON.stringify(
                    JSON.parse(row.data.payload as string) ?? {},
                    null,
                    2
                  )}
                </pre>
              </div>

              <div className="pt-6 text-sm">
                <Link
                  href={`/logs?${new URLSearchParams({
                    filter: JSON.stringify({
                      jobId: row._id,
                    }),
                  }).toString()}`}
                >
                  <a className="underline text-gray-700 decoration-gray-700 hover:text-brand-700 hover:decoration-brand-700 transition">
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
