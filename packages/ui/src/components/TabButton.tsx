import React from "react";
import cx from "classnames";

interface TabButtonProps extends React.HTMLProps<HTMLButtonElement> {
  icon: React.ComponentType<React.ComponentProps<"svg">>;
  active: boolean;
  label: string;
  iconClassName?: React.ComponentPropsWithoutRef<"svg">["className"];
  labelClassName?: React.ComponentPropsWithoutRef<"span">["className"];
  type?: "submit" | "reset" | "button";
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
    type={type ?? "button"}
    className={cx(
      "flex flex-row items-center rounded-md px-3 py-2 hover:bg-gray-100",
      active ? "text-primary-500" : "text-gray-500",
      className
    )}
    {...rest}
  >
    <Icon className={cx("h-4 w-4 md:mr-1", iconClassName)} />
    <span className={cx("inline-block", labelClassName)}>{label}</span>
  </button>
);
