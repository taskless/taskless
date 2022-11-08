import { Queue } from "@taskless/client";
import { GraphQLClient } from "@taskless/graphinql";
import { createQueue as nextCreateQueue } from "@taskless/next";
import { createQueue as expressCreateQueue } from "@taskless/express";

const checks = [
  ["@taskless/graphinql", GraphQLClient],
  ["@taskless/client", Queue],
  ["@taskless/next", nextCreateQueue],
  ["@taskless/express", expressCreateQueue],
];

checks.forEach(([p, check]) => {
  (Array.isArray(check) ? check : [check]).forEach((value) => {
    if (typeof value === "undefined") {
      console.error("❌ ESM: " + p);
      throw new Error("CommonJS require() error");
    }
  });

  console.error("✅ ESM: " + p);
});
