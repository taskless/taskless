// Applies frontmatter to external next.js attributes

import { Schema, nodes, Tag } from "@markdoc/markdoc";

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
