import test from "ava";
import { JobError } from "../src/error.js";

test("Errors are typed & extended correctly for non-TS use cases", (t) => {
  const e = new JobError("sample message");
  t.true(e instanceof Error);
});
