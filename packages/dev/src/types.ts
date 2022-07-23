/** The context for a Mock GraphQL request */
export type Context = {
  applicationId: string;
  organizationId: string;
  v5: (str: string) => string;
};
