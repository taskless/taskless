import NextLink from "next/link";
import React, { AnchorHTMLAttributes } from "react";

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
