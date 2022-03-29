import type { NextPage } from "next";
import { useQuery } from "react-query";
import { GetDashboardStatsResponse } from "./api/dashboard/stats";
import { Layout } from "components/Layout";

const getStats = async () => {
  const response = await fetch("/api/dashboard/stats");
  const result = await response.json();
  return result;
};

const Home: NextPage = () => {
  const { data } = useQuery<GetDashboardStatsResponse>("stats", getStats, {
    refetchInterval: 1000,
  });

  return (
    <Layout title="Taskless Development Server" route="/">
      <section>
        <h1 className="text-3xl font-bold">Overview</h1>
        <dl>
          <dt>Scheduled:</dt>
          <dd>{data?.scheduled ?? 0}</dd>
          <dt>Completed:</dt>
          <dd>{data?.completed ?? 0}</dd>
        </dl>
      </section>
    </Layout>
  );
};

export default Home;
