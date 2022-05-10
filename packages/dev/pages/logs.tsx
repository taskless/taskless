import type { NextPage } from "next";
import { QueryFunction, useQuery } from "react-query";
import { Layout } from "components/Layout";
import { DataTable } from "components/shared/DataTable";
import { DateTime } from "luxon";
import { XIcon } from "@heroicons/react/solid";
import { GetLogsResponse } from "./api/rest/logs";
import { useRouter } from "next/router";

export const getLogs: QueryFunction<
  GetLogsResponse,
  ["logs", { search: string }]
> = async ({ queryKey }) => {
  const [_key, { search }] = queryKey;
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
    refetchInterval: 5000,
  });

  return (
    <Layout title="Logs - Taskless Development Server">
      <div className="bg-white shadow-lg rounded p-3">
        <div className="flex flex-row items-center gap-3">
          <h2 className="text-xl font-medium pb-1 text-ellipsis flex flex-row items-center">
            {q ? "Results for:" : "All Logs"}
          </h2>
          {q ? <code className="text-xs">{q}</code> : null}
        </div>
        <DataTable<GetLogsResponse["logs"][0]>
          data={data?.logs ?? []}
          columns={[
            {
              name: "ID",
              renderValue: ({ record }) => <code>{record._id}</code>,
            },
            {
              name: "Job",
              headerClassName: "w-1/3",
              cellClassName: "relative",
              renderValue: ({ record }) => (
                <span className="absolute left-3 right-3 top-4 whitespace-nowrap overflow-hidden text-ellipsis">
                  {record.job?.name ?? "-"}
                </span>
              ),
            },
            {
              name: "Run",
              renderValue: ({ record }) => (
                <span
                  title={DateTime.fromJSDate(new Date(record.createdAt ?? 0))
                    .toLocal()
                    .toISO()}
                >
                  {DateTime.fromJSDate(
                    new Date(record.createdAt ?? 0)
                  ).toRelative()}
                </span>
              ),
            },
            {
              name: "Status",
              renderValue: ({ record }) => <>{record.status}</>,
            },
          ]}
          hasDetailsColumn
          detailsButtonClassName="text-sm text-gray-500"
          renderDetails={({ record, close }) => (
            <div className="ml-6 mb-3 px-3 pb-3 pt-2 bg-gray-100 flex flex-col rounded relative">
              <button
                className="self-end text-gray-600 hover:text-gray-900 transition self-start absolute top-3"
                onClick={() => close()}
              >
                <XIcon className="w-3 h-3" />
              </button>
              <div className="pb-6">
                <h4 className="text-lg font-medium flex-grow">Details</h4>
                <div className="flex flex-col w-full text-sm pt-3 lg:pt-6">
                  <span className="text-sm font-bold font-mono text-gray-700">
                    Headers
                  </span>
                  <pre className="text-xs max-w-none overflow-x-scroll p-3 bg-gray-800 text-white">
                    {JSON.stringify(record.job?.headers ?? {}, null, 2)}
                  </pre>
                </div>

                <div className="flex flex-col w-full text-sm pt-3 lg:pt-6">
                  <span className="text-sm font-bold font-mono text-gray-700">
                    Body
                  </span>
                  <pre className="text-xs max-w-none overflow-x-scroll p-3 bg-gray-800 text-white">
                    {JSON.stringify(
                      JSON.parse(record.job?.body as string) ?? {},
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div className="flex flex-col w-full text-sm pt-3 lg:pt-6">
                  <span className="text-sm font-bold font-mono text-gray-700">
                    Response
                  </span>
                  <pre className="text-xs max-w-none overflow-x-scroll p-3 bg-gray-800 text-white">
                    {JSON.stringify(
                      JSON.parse(record.output as string) ?? {},
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </Layout>
  );
};

export default Logs;
