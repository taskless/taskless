import { Tag } from "@markdoc/markdoc";

export const tabs = {
  render: "Tabs",
  attributes: {},
  transform(node: any, config: any) {
    const labels = node
      .transformChildren(config)
      .filter((child: any) => child && child.name === "Tab")
      .map((tab: any) =>
        typeof tab === "object" ? tab.attributes.label : null
      );

    return new Tag(this.render, { labels }, node.transformChildren(config));
  },
};

export const tab = {
  render: "Tab",
  attributes: {
    label: {
      type: String,
    },
  },
};
