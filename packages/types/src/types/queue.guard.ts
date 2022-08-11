import { type FinalizedQueueOptions, type QueueOptions } from "./queue.js";

/** Typeguard for {@link FinalizedQueueOptions} */
export const isFinalizedQueueOptions = (
  o: QueueOptions
): o is FinalizedQueueOptions => {
  return (
    typeof o.credentials?.projectId !== "undefined" &&
    typeof o.credentials?.secret !== "undefined"
  );
};
