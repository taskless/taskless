import Highlight, { defaultProps, Language } from "prism-react-renderer";
import vsDark from "prism-react-renderer/themes/vsDark";
import React, { useEffect } from "react";
import copy from "copy-to-clipboard";
import cx from "classnames";

interface CodeProps {
  "data-language": string;
  content: string;
}

export const Fence: React.FC<
  React.BaseHTMLAttributes<HTMLDivElement> & CodeProps
> = ({ content, "data-language": language }) => {
  const [copied, setCopied] = React.useState(false);
  const ref = React.useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (copied) {
      copy(ref.current?.innerText ?? "");
      const to = setTimeout(setCopied, 1000, false);
      return () => clearTimeout(to);
    }

    return undefined;
  }, [copied]);

  return (
    <div className="code relative" aria-live="polite">
      <Highlight
        {...defaultProps}
        theme={vsDark}
        code={content.trim()}
        language={language as Language}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={cx(className, "pt-10")} style={style}>
            {tokens.map((line, i) => (
              <div
                key={i}
                {...getLineProps({ line, key: i })}
                className="table-row"
              >
                <span className="table-cell pr-2 select-none">{i + 1}</span>
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      <pre ref={ref} className="hidden" aria-hidden>
        {content.trim()}
      </pre>
      <button
        className="absolute right-2 top-2 py-0 px-1 bg-primary-100/50 text-white rounded"
        onClick={() => setCopied(true)}
      >
        {copied ? "✔️" : "📄"}
      </button>
    </div>
  );
};
