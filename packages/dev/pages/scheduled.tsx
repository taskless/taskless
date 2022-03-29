import type { NextPage } from "next";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { Layout } from "components/Layout";
import { DateTime } from "luxon";
import { GetScheduledJobsResponse } from "./api/get-scheduled-jobs";
import { Play } from "components/icons/Play";

const getScheduledJobs = async () => {
  const response = await fetch("/api/get-scheduled-jobs");
  const result = await response.json();
  return result;
};

const sample = [
  {
    runs: 1,
    schedule: { attempt: 0, check: false, next: new Date().getTime() + 40000 },
    data: {
      name: "sample",
      headers: { "content-type": "application/json" },
      enabled: true,
      endpoint: "http://localhost:3000/api/queues/sample",
      payload:
        '{"v":1,"transport":{"ev":1,"alg":"aes-256-gcm","atl":16,"at":"FzE4BNllx2UcKIGksDGiNw==","iv":"HoK7q1DbsRpVHAMp"},"text":"QMzX3jJAs5kxNzxscrZisjQRaxQBRY/u4rtTEcgY","signature":"aA+Cx68Z0QuPl5JSvg5eGRvIdE/ERT+R47txR3z+Eqs="}',
      retries: 5,
      runAt: "2022-03-28T17:14:15.308-07:00",
      runEvery: null,
    },
    lastLog: "2022-03-28T17:14:15.532-07:00",
    _id: "0d89177e-a678-53a7-ab0d-c03be874c53d",
    _rev: "3-37527cb2c062dc4c21d1b1e4add27810",
  },
];

const Home: NextPage = () => {
  const { data } = useQuery<GetScheduledJobsResponse>(
    "scheduled",
    getScheduledJobs
  );

  return (
    <Layout title="Scheduled" route="/scheduled">
      <section>
        <h1 className="text-3xl font-bold">Scheduled Tasks</h1>
        <table className="table-fixed w-full mt-3">
          <thead>
            <tr>
              <th className="text-left">In</th>
              <th className="text-left">Name</th>
              <th className="text-left">Endpoint</th>
              <th className="text-left">Payload</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>
          {(sample || data || []).map((row) => {
            const dt = row.lastLog
              ? DateTime.fromMillis(row.schedule.next)
              : DateTime.now();
            const ep = new URL(row.data.endpoint);
            return (
              <tr key={row.data.name}>
                <td title={dt.toISO()}>{dt.toRelative()}</td>
                <td className="truncate">{row.data.name}</td>
                <td className="truncate">{ep.pathname}</td>
                <td className="truncate">{`${row.data.payload}`}</td>
                <td>
                  <Play />
                </td>
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
  await qc.prefetchQuery("scheduled", getScheduledJobs);
  return {
    props: {
      dehydratedState: dehydrate(qc),
    },
  };
}

export default Home;
