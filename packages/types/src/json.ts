import { z } from "zod";

export const literal = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export type Literal = z.infer<typeof literal>;

export type Json = Literal | { [key: string]: Json } | Json[];
export const json: z.ZodType<Json> = z.lazy(() =>
  z.union([literal, z.array(json), z.record(json)])
);
