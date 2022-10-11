import React from "react";
import cx from "classnames";

interface SwitchInputProps {
  id: string;
  label?: string | JSX.Element;
  description?: string | JSX.Element;
  error?: string;
  props?: React.ComponentPropsWithRef<"input">;
}

export const SwitchInput: React.FC<SwitchInputProps> = ({
  id,
  label,
  description,
  error,
  props,
}) => {
  const { className: inputClassName, ...inputProps } = props ?? {};

  return (
    <fieldset>
      <div className="flex flex-row-reverse items-center justify-between gap-6">
        <span className="flex flex-grow flex-col">
          <label htmlFor={id} className="text-sm font-medium text-gray-700">
            {label}
            <em
              className={cx(
                "block text-xs",
                error ? "text-orange-500" : "text-gray-500"
              )}
            >
              {error ?? description ?? null}
            </em>
          </label>
        </span>
        <div className="relative flex items-center">
          <input
            id={id}
            type="checkbox"
            className="peer hidden appearance-none"
            {...inputProps}
          />
          <label
            htmlFor={id}
            className={cx(
              "h-6 w-10",
              "flex flex-shrink-0 items-center rounded-full bg-gray-300 p-0.5 duration-300 ease-in-out",
              "peer-checked:bg-primary-500",
              "after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:duration-300 peer-checked:after:translate-x-4",
              inputClassName
            )}
          />
        </div>
      </div>
    </fieldset>
  );
};
