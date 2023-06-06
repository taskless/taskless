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
  const title = (matter?.title as string) ?? "Taskless Docs";
  return (
    <>
      <Head>
        <title key="title">{title}</title>
      </Head>
      <article {...rest} />
    </>
  );
};
