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
        className="block text-sm font-medium text-gray-700 whitespace-nowrap"
      >
        {label ?? null}
        <em
          className={cx(
            "text-xs ml-2",
            error ? "text-orange-500" : "text-gray-500"
          )}
        >
          {error ?? description ?? null}
        </em>
      </label>
      <div className="mt-1">
        <textarea
          id={id}
          className={cx(
            "shadow-sm block w-full sm:text-sm border-gray-300 rounded-md focus:border-gray-600 focus:outline-0 focus:ring-0",
            inputClassName
          )}
          rows={5}
          {...inputProps}
        />
      </div>
    </fieldset>
  );
};
