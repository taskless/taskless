import React from "react";
import cx from "classnames";

interface TabButtonProps extends React.HTMLProps<HTMLButtonElement> {
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  active: boolean;
  label: string;
  iconClassName?: React.ComponentPropsWithoutRef<"svg">["className"];
  labelClassName?: React.ComponentPropsWithoutRef<"span">["className"];
}

export const TabButton: React.FC<TabButtonProps> = ({
  type,
  className,
  iconClassName,
  labelClassName,
  icon: Icon,
  label,
  active,
  ...rest
}) => (
  <button
    type={"button"}
    className={cx(
      "flex flex-row items-center rounded-md hover:bg-gray-100 px-3 py-2",
      active ? "text-brand-500" : "text-gray-500",
      className
    )}
    {...rest}
  >
    <Icon className={cx("h-4 w-4 md:mr-1", iconClassName)} />
    <span className="inline-block">{label}</span>
  </button>
);
