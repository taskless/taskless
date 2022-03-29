import type { NextPage } from "next";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { GetDashboardStatsResponse } from "./api/get-dashboard-stats";
import { Layout } from "components/Layout";

const getStats = async () => {
  const response = await fetch("/api/get-dashboard-stats");
  const result = await response.json();
  return result;
};

const Home: NextPage = () => {
  const { data } = useQuery<GetDashboardStatsResponse>("stats", getStats);

  return (
    <Layout title="Taskless Development Server" route="/">
      <section>
        <h1 className="text-3xl font-bold">Overview</h1>
        <dl>
          <dt>Scheduled:</dt>
          <dd>{data?.scheduled}</dd>
          <dt>Completed:</dt>
          <dd>{data?.completed}</dd>
        </dl>
      </section>
    </Layout>
  );
};

export async function getStaticProps() {
  const qc = new QueryClient();
  await qc.prefetchQuery("stats", getStats);
  return {
    props: {
      dehydratedState: dehydrate(qc),
    },
  };
}

export default Home;
