import React from "react";
import cx from "classnames";

const DEFAULT_CLASSES = "fill-transparent stroke-brand-400 stroke-5";

interface LogoProps {
  className: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => (
  <svg
    viewBox="0 0 265 265"
    xmlns="http://www.w3.org/2000/svg"
    className={cx(DEFAULT_CLASSES, className)}
  >
    <path d="M165.123 136.997L105.925 81.2033V52.5V50H103.425H57.9862L7.17637 2.53333L56.0692 2.53334L206.653 2.53333L257.462 50H167.623H165.123V52.5V136.997ZM106 203.416V115.211L165.197 171.004V259.208L106 203.416Z" />
  </svg>
);
