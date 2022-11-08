// changes the beheavior of a heading to a custom component
import { Schema, Tag, nodes } from "@markdoc/markdoc";

const generateID = (
  children: unknown[],
  attributes: Record<string, unknown>
) => {
  if (attributes.id && typeof attributes.id === "string") {
    return attributes.id;
  }
  return children
    .filter((child) => typeof child === "string")
    .join(" ")
    .replace(/[?]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
};

export const heading: Schema = {
  ...nodes.heading,
  render: "Heading",
  transform(node, config) {
    console.log(node);
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);
    const id = generateID(children, attributes);

    return new Tag(
      this.render,
      { ...attributes, level: node.attributes.level ?? 1, id },
      children
    );
  },
};
