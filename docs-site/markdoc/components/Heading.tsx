import * as React from "react";

interface HeadingProps {
  id?: string;
  level?: number;
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  id = "",
  level = 1,
  children,
  className,
}) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  const link = (
    <Component className={className}>
      <div id={id} />
      {children}
    </Component>
  );

  return level !== 1 ? (
    <a href={`#${id}`} className="no-underline">
      {link}
    </a>
  ) : (
    link
  );
};
