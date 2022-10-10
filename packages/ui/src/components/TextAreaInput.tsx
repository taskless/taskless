import React from "react";
import cx from "classnames";

interface TextAreaInputProps {
  id: string;
  label?: string | JSX.Element;
  description?: string | JSX.Element;
  error?: string;
  props?: React.ComponentPropsWithoutRef<"textarea">;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({
  id,
  label,
  description,
  error,
  props,
}) => {
  const { className: inputClassName, ...inputProps } = props ?? {};

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
        <textarea
          id={id}
          className={cx(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-600 focus:outline-0 focus:ring-0 sm:text-sm",
            inputClassName
          )}
          rows={5}
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
