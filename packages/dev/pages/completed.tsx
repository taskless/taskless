import type { NextPage } from "next";
import { useQuery } from "react-query";
import { Layout } from "components/Layout";
import { GetCompletedJobsResponse } from "./api/dashboard/completed";
import { CompletedRecord } from "components/CompletedRecord";

const getCompletedJobs = async (): Promise<GetCompletedJobsResponse> => {
  const response = await fetch("/api/dashboard/completed");
  const result = await response.json();
  return result;
};

const Home: NextPage = () => {
  const { data } = useQuery("completed", getCompletedJobs);

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
          <tbody>
            {(data || []).map((row) => (
              <CompletedRecord
                key={row._id}
                row={row}
                widths={["w-20", "w-56", "w-40", "w-48"]}
              />
            ))}
          </tbody>
        </table>
      </section>
    </Layout>
  );
};

export default Home;
