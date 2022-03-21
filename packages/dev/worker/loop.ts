import { DateTime } from "luxon";

let started = false;
export const start = () => {
  if (started) {
    return;
  }
  started = true;
};

const tick = () => {
  // on tick, get all jobs that were supposed to run
  // for each item:
  // 1. set ranAt (marks as ran)
  // 2. Attempt and log result
  // 3. On failure
  //    1. if has attempts, insert new runner (+3s) with attempts+=1
};
