// Applies frontmatter to external next.js attributes
import Head from "next/head";
import React, { BaseHTMLAttributes } from "react";

type DocumentProps = {
  matter?: Yaml;
};

type Yaml = Record<string, unknown>;

export const Document: React.FC<
  BaseHTMLAttributes<HTMLDivElement> & DocumentProps
> = ({ matter, ...rest }) => {
  return (
    <>
      <Head>
        <title key="title">{matter?.title ?? "Taskless Docs"}</title>
      </Head>
      <article {...rest} />
    </>
  );
};
