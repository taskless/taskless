// changes the beheavior of a link to a Link object from next.js
import { Schema, nodes } from "@markdoc/markdoc";

export const link: Schema = {
  ...nodes.link,
  render: "Link",
};
