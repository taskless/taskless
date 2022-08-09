/** The context for a Mock GraphQL request */
export type Context = {
  projectId: string;
  queueName: string;
  v5: (str: string) => string;
};
