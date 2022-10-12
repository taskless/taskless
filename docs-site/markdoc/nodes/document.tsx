// Applies frontmatter to external next.js attributes

import { Schema, nodes, Tag } from "@markdoc/markdoc";
import Head from "next/head";
import React, { BaseHTMLAttributes } from "react";

export const document: Schema = {
  ...nodes.document,
  render: "Document",
  attributes: {
    ...nodes.document.attributes,
    frontmatter: {
      render: false,
    },
    matter: {
      render: true,
    },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    return new Tag(
      `Document`,
      { ...attributes, matter: config.variables?.frontmatter ?? {} },
      children
    );
  },
};

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
