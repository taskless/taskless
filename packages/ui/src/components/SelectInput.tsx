import React from "react";
import cx from "classnames";

type Options = {
  label: string;
  value: string;
  other?: boolean;
};

interface SelectInputProps {
  id: string;
  label?: string | JSX.Element;
  description?: string | JSX.Element;
  error?: string;
  options: Options[];
  props?: React.ComponentPropsWithoutRef<"select">;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  label,
  description,
  error,
  options,
  props,
}) => {
  const { className: selectClassName, ...selectProps } = props ?? {};

  return (
    <fieldset>
      <label
        htmlFor={id}
        className="block whitespace-nowrap text-sm font-medium text-gray-700"
      >
        {label ?? null}
        <em
          className={cx(
            "ml-2 text-xs",
            error ? "text-orange-500" : "text-gray-500"
          )}
        >
          {error ?? null}
        </em>
      </label>
      <div className="mt-1">
        <select
          id={id}
          className={cx(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-600 focus:outline-0 focus:ring-0 sm:text-sm",
            selectClassName
          )}
          {...selectProps}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {description ? (
        <em className={cx("text-xs", "text-gray-500")}>
          {description ?? null}
        </em>
      ) : null}
    </fieldset>
  );
};
