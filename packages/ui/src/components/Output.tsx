import React, { useEffect } from "react";
import cx from "classnames";
import Highlight, { defaultProps } from "prism-react-renderer";
import copy from "copy-to-clipboard";

import theme from "prism-react-renderer/themes/vsDark/index.js";
import { ClipboardCopyIcon } from "@heroicons/react/solid/index.js";

interface OutputProps {
  className?: string;
  output?: string;
}

const deserializeNestedJson = (key: string, value: unknown) => {
  if (
    typeof value === "string" &&
    value.indexOf("{") === 0 &&
    value.lastIndexOf("}") === value.length - 1
  ) {
    return [
      "// DESERIALIZED JSON",
      "// The following JSON object is stored as a string",
      JSON.parse(value),
      "// END DESERIALIZED JSON",
    ];
  }
  return value;
};

const noop = () => {
  /*empty*/
};

export const Output: React.FC<OutputProps> = ({
  className: rootClassName,
  output,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (copied) {
      copy(output ?? "");
      const to = setTimeout(setCopied, 1000, false);
      return () => clearTimeout(to);
    }
    return noop;
  }, [copied, output]);

  const s = output ?? "";
  const o =
    s.indexOf("{") === 0 && s.lastIndexOf("}") === s.length - 1
      ? JSON.parse(s)
      : s;
  const isJSON = typeof o === "string" ? false : true;
  const formatted = JSON.stringify(o, deserializeNestedJson, 2);

  return (
    <div className="relative" aria-live="polite">
      <Highlight
        {...defaultProps}
        theme={theme}
        code={formatted}
        language={isJSON ? "json" : "markdown"}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={cx(rootClassName, className)} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      <button
        className={cx(
          "absolute right-2 top-2 py-1 px-1 bg-primary-100/50 text-white rounded",
          copied ? "!bg-white text-primary-200" : ""
        )}
        onClick={() => setCopied(true)}
      >
        <ClipboardCopyIcon className="h-5 w-5" />
      </button>
    </div>
  );
};
