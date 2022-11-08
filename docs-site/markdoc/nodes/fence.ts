import { Schema, Tag } from "@markdoc/markdoc";

export const fence: Schema = {
  render: "Fence",
  attributes: {
    content: { type: String, render: "content", required: true },
    language: { type: String, render: "data-language" },
    process: { type: Boolean, render: false, default: true },
  },
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.children.length
      ? node.transformChildren(config)
      : [node.attributes.content];

    return new Tag("Fence", attributes, children);
  },
};
