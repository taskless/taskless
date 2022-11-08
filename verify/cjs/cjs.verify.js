/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const { Queue } = require("@taskless/client");
const { createQueue: nextCreateQueue } = require("@taskless/next");
const { createQueue: expressCreateQueue } = require("@taskless/express");
const { GraphQLClient } = require("@taskless/graphinql");

const checks = [
  ["@taskless/graphinql", GraphQLClient],
  ["@taskless/client", Queue],
  ["@taskless/next", nextCreateQueue],
  ["@taskless/express", expressCreateQueue],
];

checks.forEach(([p, check]) => {
  (Array.isArray(check) ? check : [check]).forEach((value) => {
    if (typeof value === "undefined") {
      console.error("❌ CJS: " + p);
      throw new Error("CommonJS require() error");
    }
  });

  console.error("✅ CJS: " + p);
});
