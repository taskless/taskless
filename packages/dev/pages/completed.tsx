import type { NextPage } from "next";
import { useQuery } from "react-query";
import { Layout } from "components/Layout";
import { GetCompletedJobsResponse } from "./api/dashboard/completed";
import { DateTime } from "luxon";

const getCompletedJobs = async () => {
  const response = await fetch("/api/dashboard/completed");
  const result = await response.json();
  return result;
};

const Home: NextPage = () => {
  const { data } = useQuery<GetCompletedJobsResponse>(
    "completed",
    getCompletedJobs
  );

  return (
    <Layout title="Taskless Development Server" route="/completed">
      <section>
        <h1 className="text-3xl font-bold">Completed Tasks</h1>
        <table className="table-fixed w-full mt-3">
          <thead>
            <tr>
              <th className="text-left w-20"></th>
              <th className="text-left w-56">Time</th>
              <th className="text-left w-40">Name</th>
              <th className="text-left w-48">Endpoint</th>
              <th className="text-left">Payload</th>
            </tr>
          </thead>
          {(data || []).map((row) => {
            const dt = row.lastLog
              ? DateTime.fromISO(row.lastLog)
              : DateTime.now();
            const ep = new URL(row.data.endpoint);
            return (
              <tr key={row.data.name}>
                <td></td>
                <td title={dt.toISO()}>
                  {dt.toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)}
                </td>
                <td className="truncate">{row.data.name}</td>
                <td className="truncate" title={ep.toString()}>
                  {ep.pathname}
                </td>
                <td className="truncate">{`${row.data.payload}`}</td>
              </tr>
            );
          })}
        </table>
      </section>
    </Layout>
  );
};

export default Home;
