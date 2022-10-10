import React from "react";
import cx from "classnames";

interface TextInputProps {
  id: string;
  label?: string | JSX.Element;
  description?: string | JSX.Element;
  error?: string;
  props?: React.ComponentPropsWithoutRef<"input">;
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  description,
  error,
  props,
}) => {
  const { className: inputClassName, ...inputProps } = props ?? {};

  return (
    <fieldset>
      {label ? (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
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
      ) : null}
      <div className={cx(label ? "mt-1" : "")}>
        <input
          type="text"
          id={id}
          className={cx(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-600 focus:outline-0 focus:ring-0 sm:text-sm",
            inputClassName
          )}
          {...inputProps}
        />
      </div>
      {description ? (
        <em className={cx("text-xs", "text-gray-500")}>
          {description ?? null}
        </em>
      ) : null}
    </fieldset>
  );
};
