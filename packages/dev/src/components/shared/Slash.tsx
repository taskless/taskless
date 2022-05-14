import React from "react";
import cx from "classnames";

interface SlashProps extends React.SVGAttributes<{}> {}

export const Slash: React.FC<SlashProps> = ({ className, ...rest }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      shapeRendering="geometricPrecision"
      className={cx("stroke-1 fill-current stroke-current", className)}
      {...rest}
    >
      <path d="M16.88 3.549L7.12 20.451"></path>
    </svg>
  );
};
