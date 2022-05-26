import React, { PropsWithChildren } from "react";
import cx from "classnames";

interface RegionProps extends React.HTMLProps<HTMLDivElement> {
  active?: boolean;
  activeClassName?: React.ComponentPropsWithoutRef<"div">["className"];
}

export const Region: React.FC<PropsWithChildren<RegionProps>> = ({
  children,
  className,
  activeClassName,
  active,
  ...rest
}) => (
  <div
    className={cx(className, active ? activeClassName : undefined)}
    {...rest}
  >
    {children}
  </div>
);
