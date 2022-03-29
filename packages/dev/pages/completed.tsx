import type { NextPage } from "next";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { Layout } from "components/Layout";
import { GetCompletedJobsResponse } from "./api/get-completed-jobs";
import { DateTime } from "luxon";

const getCompletedJobs = async () => {
  const response = await fetch("/api/get-completed-jobs");
  const result = await response.json();
  return result;
};

const Home: NextPage = () => {
  const { data } = useQuery<GetCompletedJobsResponse>(
    "completed",
    getCompletedJobs
  );

  console.log(data);

  return (
    <Layout title="Taskless Development Server" route="/completed">
      <section>
        <h1 className="text-3xl font-bold">Completed Tasks</h1>
        <table className="table-fixed w-full mt-3">
          <thead>
            <tr>
              <th className="text-left">Ran</th>
              <th className="text-left">Name</th>
              <th className="text-left">Endpoint</th>
              <th className="text-left">Payload</th>
              <th className="text-left">Details</th>
            </tr>
          </thead>
          {(data || []).map((row) => {
            const dt = row.lastLog
              ? DateTime.fromISO(row.lastLog)
              : DateTime.now();
            const ep = new URL(row.data.endpoint);
            return (
              <tr key={row.data.name}>
                <td title={dt.toISO()}>{dt.toRelative()}</td>
                <td className="truncate">{row.data.name}</td>
                <td className="truncate">{ep.pathname}</td>
                <td className="truncate">{`${row.data.payload}`}</td>
                <td></td>
              </tr>
            );
          })}
        </table>
      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  const qc = new QueryClient();
  await qc.prefetchQuery("completed", getCompletedJobs);
  return {
    props: {
      dehydratedState: dehydrate(qc),
    },
  };
}

export default Home;
