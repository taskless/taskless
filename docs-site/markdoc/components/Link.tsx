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

export const createLinkWithQuery = (params?: Record<string, unknown>) => {
  const LinkWithBaseHref: React.FC<AnchorHTMLAttributes<HTMLAnchorElement>> = ({
    href,
    ...rest
  }) => {
    // non-href and fully qualified URLs are as-is
    if (!href || /^https?:\/\//.test(href)) {
      return <Link href={href} {...rest} />;
    }

    // modify the href based on our params property
    let nextHref = href;
    if (params?.version) {
      nextHref += nextHref.endsWith("/") ? params.verson : `/${params.version}`;
    }

    // returns a link component rendered to the new URL
    return <Link href={nextHref} {...rest} />;
  };
  return LinkWithBaseHref;
};
