/**
 * Given an array of promises, resolve them in parallel, and then return the first
 * succeeding promise in-order. If no promises succeeded, return the first rejection
 * in-order.
 */
export const bestPromise = async <T = Promise<unknown>>(promises: T[]) => {
  const rs = await Promise.allSettled(promises);
  const { resolved, rejected } = rs.reduce<{
    resolved: T[];
    rejected: unknown[];
  }>(
    (all, p) => {
      if (p.status === "fulfilled") {
        all.resolved.push(p.value);
      } else {
        all.rejected.push(p.reason);
      }
      return all;
    },
    { resolved: [], rejected: [] }
  );

  if (resolved[0]) {
    return resolved[0];
  }

  if (rejected[0]) {
    if (rejected[0] instanceof Error) {
      throw rejected[0];
    } else {
      throw new Error(`${rejected[0]}`);
    }
  }

  throw new Error("Promise collection did not resolve or reject");
};
