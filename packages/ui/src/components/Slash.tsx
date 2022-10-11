import React, { SVGProps } from "react";
import cx from "classnames";

export const Slash: React.FC<SVGProps<SVGSVGElement>> = ({
  className,
  ...rest
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cx("fill-current stroke-current stroke-1", className)}
      {...rest}
    >
      <path d="M16.88 3.549L7.12 20.451"></path>
    </svg>
  );
};
