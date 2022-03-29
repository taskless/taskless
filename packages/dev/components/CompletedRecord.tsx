import { DateTime } from "luxon";
import { JobLogsResponse } from "pages/api/dashboard/job/logs";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { Job, Document } from "types";

interface CompletedRecordProps {
  row: Document<Job>;
  widths: string[];
}

const getJobLogs = async (id: string): Promise<JobLogsResponse> => {
  const response = await fetch("/api/dashboard/job/logs", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      id: id,
    }),
  });
  const result = await response.json();

  if (result.error) {
    throw new Error(result.error);
  }

  return result;
};

export const CompletedRecord: React.FC<CompletedRecordProps> = ({
  row,
  widths,
}) => {
  const [open, setOpen] = useState(false);
  const dt = row.lastLog ? DateTime.fromISO(row.lastLog) : DateTime.now();
  const ep = new URL(row.data.endpoint);

  const { data } = useQuery(["logs", row._id], () => getJobLogs(row._id), {
    enabled: open,
  });

  return (
    <>
      <tr>
        <td>
          {open ? (
            <button
              onClick={() => setOpen(false)}
              className="text-sm text-gray-700 hover:underline"
            >
              close
            </button>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="text-sm text-gray-700 hover:text-fuchsia-800 hover:underline"
            >
              details
            </button>
          )}
        </td>
        <td title={dt.toISO()}>
          {dt.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}
        </td>
        <td className="truncate">{row.data.name}</td>
        <td className="truncate" title={ep.toString()}>
          {ep.pathname}
        </td>
        <td className="truncate">{`${row.data.payload}`}</td>
      </tr>
      {!open ? null : (
        <tr>
          <td className="border-r border-gray-500">&nbsp;</td>
          <td colSpan={4}>
            <table className="table-auto text-gray-800">
              <thead className="text-gray-500">
                <th className={`text-left ${widths?.[1] ?? "w-auto"}`}>Time</th>
                <th className={`text-left ${widths?.[2] ?? "w-auto"}`}>
                  Status
                </th>
                <th className="text-left w-full max-w-[50%]">
                  Captured Output
                </th>
              </thead>
              <tbody>
                {(data?.logs ?? []).map((log) => {
                  const logd = DateTime.fromISO(log.ts);
                  return (
                    <tr key={log.ts}>
                      <td title={logd.toISO()} className="align-top">
                        {logd.toLocaleString(
                          DateTime.DATETIME_SHORT_WITH_SECONDS
                        )}
                      </td>
                      <td className="align-top">{log.status}</td>
                      <td className="align-top">
                        <textarea className="w-full" rows={5}>
                          {log.output}
                        </textarea>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </td>
        </tr>
      )}
    </>
  );
};
