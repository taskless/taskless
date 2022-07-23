// locally define boolean query structure
type BQ = string[][];

type Facets = {
  [name: string]: {
    __default?: boolean;
    mango: (v: string) => any;
  };
};

export const jobFacets: Facets = {
  name: {
    __default: true,
    mango: (v) => ({
      name: {
        $eq: v,
      },
    }),
  },
};

export const runFacets: Facets = {
  jobId: {
    mango: (v) => ({
      "metadata.v5id": {
        $eq: v,
      },
    }),
  },
};

/** Convert a boolean query expression to mango syntax */
export const bqToMango = (q: BQ, facets: Facets) => {
  const defaultName = Object.keys(facets)
    .map((k) => (facets[k].__default ? k : false))
    .filter((t) => t)?.[0];
  const defaultFacet = defaultName ? facets[defaultName] : null;
  const mango = {
    $or: q.map((or) => {
      return {
        $and: or.map((and) => {
          const [f, ...rest] = and.split(":");
          const facet = facets[f as keyof typeof facets];
          if (facet) {
            return facet.mango(rest.join(":"));
          } else if (defaultFacet) {
            return defaultFacet.mango([f, ...rest].join(":"));
          }
        }),
      };
    }),
  };

  return mango;
};
