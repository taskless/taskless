import { Config } from "@markdoc/markdoc";
import React from "react";
import { Document, document } from "./nodes/document";
import { Link, link } from "./nodes/link";
import { Fence, fence } from "./nodes/fence";

export const markdocSchema: Config = {
  nodes: {
    document,
    fence,
    link,
  },
  tags: {},
  variables: {},
  functions: {},
  partials: {},
};

export const markdocComponents: Record<string, React.ReactNode> = {
  Fence,
  Document,
  Link,
};
