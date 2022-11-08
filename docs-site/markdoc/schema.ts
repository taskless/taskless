import { Config } from "@markdoc/markdoc";
import React from "react";

// nodes: Override default markdown behaviors
import { document } from "./nodes/document";
import { link } from "./nodes/link";
import { fence } from "./nodes/fence";
import { heading } from "./nodes/heading";

// tags: Special {% ... %} markdoc features
import { tabs, tab } from "./tags/tabs";

// components: Renderable markdoc versions of components
import { Document } from "./components/Document";
import { Tabs, Tab } from "./components/Tabs";
import { Link } from "./components/Link";
import { Fence } from "./components/Fence";
import { Heading } from "./components/Heading";

export const markdocSchema: Config = {
  nodes: {
    document,
    fence,
    heading,
    link,
  },
  tags: {
    tabs,
    tab,
  },
  variables: {},
  functions: {},
  partials: {},
};

export const markdocComponents: Record<string, React.ReactNode> = {
  Fence,
  Heading,
  Document,
  Link,
  Tab,
  Tabs,
};
