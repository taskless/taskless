// changes the beheavior of a link to a Link object from next.js

import { Schema, nodes } from "@markdoc/markdoc";
import NextLink from "next/link";
import React, { AnchorHTMLAttributes } from "react";

export const link: Schema = {
  ...nodes.link,
  render: "Link",
};

export const Link: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
  href,
  ...rest
}) => {
  if (!href) return <a {...rest} />;
  return (
    <NextLink href={href}>
      <a {...rest} />
    </NextLink>
  );
};
