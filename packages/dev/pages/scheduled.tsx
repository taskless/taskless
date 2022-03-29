import type { NextPage } from "next";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Layout } from "components/Layout";
import { DateTime } from "luxon";
import { GetScheduledJobsResponse } from "./api/dashboard/scheduled";
import React from "react";

type PromoteVariables = {
  id: string;
};

const promoteJob = async (variables: PromoteVariables): Promise<void> => {
  await fetch("/api/dashboard/job/promote", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      id: variables.id,
    }),
  });
};

const getScheduledJobs = async (): Promise<GetScheduledJobsResponse> => {
  const response = await fetch("/api/dashboard/scheduled");
  const result = await response.json();
  return result;
};

const Home: NextPage = () => {
  const { data } = useQuery("scheduled", getScheduledJobs);
  const qc = useQueryClient();

  const promote = useMutation(promoteJob, {
    onSuccess: () => {
      qc.invalidateQueries("scheduled");
    },
  });

  return (
    <Layout title="Scheduled" route="/scheduled">
      <section>
        <h1 className="text-3xl font-bold">Scheduled Tasks</h1>
        <table className="table-fixed w-full mt-3 bg-clip-padding">
          <thead>
            <tr>
              <th className="text-left w-20"></th>
              <th className="text-left w-56">In</th>
              <th className="text-left w-40">Name</th>
              <th className="text-left w-48">Endpoint</th>
              <th className="text-left">Payload</th>
            </tr>
          </thead>
          {(data || []).map((row) => {
            const dt = row.schedule.next
              ? DateTime.fromMillis(row.schedule.next)
              : DateTime.now();
            const ep = new URL(row.data.endpoint);
            return (
              <React.Fragment key={row.data.name}>
                <tr className="border-b-8">
                  <td>
                    <div className="inline-flex relative">
                      <button
                        onClick={() =>
                          promote.mutate({
                            id: row._id,
                          })
                        }
                        className="border rounded border-fuchsia-500 px-1 hover:bg-fuchsia-900 hover:text-white hover:border-fuchsia-900"
                      >
                        run
                      </button>
                    </div>
                  </td>
                  <td title={dt.toISO()}>{dt.toRelative()}</td>
                  <td className="truncate">{row.data.name}</td>
                  <td className="truncate">{ep.pathname}</td>
                  <td className="truncate">{`${row.data.payload}`}</td>
                </tr>
                {/* TODO: Details */}
              </React.Fragment>
            );
          })}
        </table>
      </section>
    </Layout>
  );
};

export default Home;
