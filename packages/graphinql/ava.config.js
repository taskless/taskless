const config = {
  extensions: {
    ts: "module",
  },
  nodeArguments: ["--loader=ts-node/esm", "--require=./ava.env.cjs"],
};

export default config;
