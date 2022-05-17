import type { FinalizedQueueOptions, QueueOptions } from "./queue.js";

/** Typeguard for {@link FinalizedQueueOptions} */
export const isFinalizedQueueOptions = (
  o: QueueOptions
): o is FinalizedQueueOptions => {
  return (
    typeof o.credentials?.appId !== "undefined" &&
    typeof o.credentials?.secret !== "undefined"
  );
};
