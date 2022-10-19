import type { NextPage } from "next";
import { QueryFunction, useQuery } from "react-query";
import { Layout } from "components/Layout";
import { DataTable, Output } from "@taskless/ui";
import { DateTime } from "luxon";
import { XIcon } from "@heroicons/react/solid";
import { GetLogsResponse } from "./api/rest/logs";
import { useRouter } from "next/router";
import { TaskData } from "db/mq";

export const getLogs: QueryFunction<
  GetLogsResponse,
  ["logs", { search: string }]
> = async ({ queryKey }) => {
  const [, { search }] = queryKey;
  const wl =
    typeof window === "undefined"
      ? "http://localhost:3001"
      : window.location.href;
  const u = new URL("/api/rest/logs", wl);
  u.searchParams.append("q", search);
  const response = await fetch(u.toString());
  const result = await response.json();
  return result;
};

const Logs: NextPage = () => {
  const r = useRouter();
  const q = Array.isArray(r.query.q) ? r.query.q[0] : r.query.q;
  const { data } = useQuery(["logs", { search: q ?? "" }], getLogs, {
    // refetchInterval: 5000,
  });

  return (
    <Layout title="Logs - Taskless Development Server">
      <div className="rounded bg-white p-3 shadow-lg">
        <div className="flex flex-row items-center gap-3">
          <h2 className="flex flex-row items-center text-ellipsis pb-1 text-xl font-medium">
            {q ? "Results for:" : "All Logs"}
          </h2>
          {q ? <code className="text-xs">{q}</code> : null}
        </div>
        <DataTable<GetLogsResponse["runs"][0]>
          data={data?.runs ?? []}
          columns={[
            {
              name: "ID",
              renderValue: ({ record }) => (
                <code>{record.metadata.id ?? ""}</code>
              ),
            },
            {
              name: "Job",
              headerClassName: "w-1/3",
              cellClassName: "relative",
              renderValue: ({ record }) => (
                <span className="absolute left-3 right-3 top-4 overflow-hidden text-ellipsis whitespace-nowrap">
                  {record.metadata.name ?? "-"}
                </span>
              ),
            },
            {
              name: "Run",
              renderValue: ({ record }) => (
                <span
                  title={DateTime.fromJSDate(new Date(record.ts ?? 0))
                    .toLocal()
                    .toISO()}
                >
                  {DateTime.fromJSDate(new Date(record.ts ?? 0)).toRelative()}
                </span>
              ),
            },
            {
              name: "Status",
              renderValue: ({ record }) => (
                <>{record.success ? "COMPLETED" : "FAILED"}</>
              ),
            },
          ]}
          hasDetailsColumn
          detailsButtonClassName="text-sm text-gray-500"
          renderDetails={({ record, close }) => {
            let payload: TaskData | undefined;
            try {
              payload = JSON.parse(record.payload);
            } catch {
              // do nothing
            }
            return (
              <div className="relative ml-6 mb-3 flex flex-col rounded bg-gray-100 px-3 pb-3 pt-2">
                <button
                  className="absolute top-3 self-start self-end text-gray-600 transition hover:text-gray-900"
                  onClick={() => close()}
                >
                  <XIcon className="h-3 w-3" />
                </button>
                <div className="pb-6">
                  <h4 className="flex-grow text-lg font-medium">Details</h4>
                  <div className="flex w-full flex-col pt-3 text-sm lg:pt-6">
                    <span className="font-mono text-sm font-bold text-gray-700">
                      Headers
                    </span>
                    <Output
                      className="max-w-none overflow-x-scroll bg-gray-800 p-3 text-xs text-white rounded"
                      output={payload?.headers}
                    />
                  </div>

                  <div className="flex w-full flex-col pt-3 text-sm lg:pt-6">
                    <span className="font-mono text-sm font-bold text-gray-700">
                      Body
                    </span>
                    <Output
                      className="max-w-none overflow-x-scroll bg-gray-800 p-3 text-xs text-white rounded"
                      output={payload?.body ?? undefined}
                    />
                  </div>

                  <div className="flex w-full flex-col pt-3 text-sm lg:pt-6">
                    <span className="font-mono text-sm font-bold text-gray-700">
                      Response
                    </span>
                    <Output
                      className="max-w-none overflow-x-scroll bg-gray-800 p-3 text-xs text-white rounded"
                      output={record.body}
                    />
                  </div>
                </div>
              </div>
            );
          }}
        />
      </div>
    </Layout>
  );
};

export default Logs;
