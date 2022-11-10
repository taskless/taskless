import { readFile } from "fs/promises";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import path from "path";
import yaml from "js-yaml";
import Markdoc, { RenderableTreeNode } from "@markdoc/markdoc";
import React, { useMemo } from "react";
import cx from "classnames";
import { markdocComponents, markdocSchema } from "../../markdoc/schema";
import { useRouter } from "next/router";
import { createLinkWithQuery } from "../../markdoc/components/Link";
import { bestPromise } from "../../util/bestPromise";

interface Manifest {
  title: string;
  url: string;
  routes: Manifest[];
}

interface NavigationItemProps {
  item: Manifest;
  depth?: number;
  query?: Record<string, unknown>;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
  item,
  depth = 0,
  query,
}) => {
  const router = useRouter();
  const isCurrent = router.asPath === item.url;
  const Link = createLinkWithQuery(query);

  return (
    <>
      <div style={{ paddingLeft: depth === 0 ? "0" : `${depth}em` }}>
        {item.url ? (
          <Link
            href={item.url}
            className={cx(
              isCurrent
                ? "bg-gray-100 text-gray-900"
                : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              "group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md"
            )}
          >
            {item.title}
          </Link>
        ) : (
          <span
            className={cx(
              "bg-white text-gray-600",
              "group w-full flex items-center px-2 py-2 text-sm font-medium rounded-md"
            )}
          >
            {item.title}
          </span>
        )}
      </div>
      {(item?.routes || []).map((sub) => (
        <NavigationItem
          key={sub.title}
          depth={depth + 1}
          item={sub}
          query={query}
        />
      ))}
    </>
  );
};

interface DocsProps {
  manifest: Manifest[];
  content: RenderableTreeNode;
  version: string | null;
}

const Docs: NextPage<DocsProps> = ({ manifest, content, version }) => {
  const query = useMemo(() => ({ version }), [version]);

  const docs = useMemo(
    () =>
      content
        ? Markdoc.renderers.react(content, React, {
            components: {
              ...markdocComponents,
              Link: createLinkWithQuery(query),
            },
          })
        : null,
    [content, query]
  );

  return (
    <>
      <div className="h-15 flex justify-items-center items-center pb-4">
        <p className="w-full text-center pt-4 border-b">
          Taskless Docs Preview Server
        </p>
      </div>
      <div className="flex flex-row max-w-6xl mx-auto px-4 md:px-0 gap-6">
        <nav
          className="flex-shrink-0 pr-2 pt-6 space-y-1 bg-white"
          aria-label="Sidebar"
        >
          {version ? (
            <p className="m-0 p-2 text-sm bg-orange-100 prose">
              Version: {version ?? "latest"}
            </p>
          ) : null}
          {(manifest ?? []).map((item) => (
            <NavigationItem
              depth={0}
              item={item}
              key={item.title}
              query={query}
            />
          ))}
        </nav>
        <div className="max-w-6xl mx-auto py-6 min-h-screen">
          <div
            className={cx([
              "prose",
              "max-w-none",
              "prose-blockquote:not-italic",
              "prose-blockquote:bg-gray-100",
              "prose-blockquote:py-1",
              "prose-code:text-fuchsia-600",
              "prose-a:transition",
              "prose-a:text-primary-500",
              "hover:prose-a:text-primary-400",
            ])}
          >
            {docs}
          </div>
        </div>
      </div>
    </>
  );
};
export default Docs;

export const getStaticPaths: GetStaticPaths = async () => {
  return Promise.resolve({
    paths: [],
    fallback: true,
  });
};

export const getStaticProps: GetStaticProps<DocsProps> = async (ctx) => {
  const nextdoc =
    typeof ctx.params?.nextdoc === "undefined"
      ? []
      : Array.isArray(ctx.params.nextdoc)
      ? ctx.params.nextdoc
      : [ctx.params.nextdoc];
  const last = nextdoc.pop();
  const version = /@[0-9.]+/.test(last ?? "");

  try {
    const fileContents = await bestPromise(
      [
        // literal path
        path.resolve(
          process.cwd(),
          "../docs",
          [...nextdoc, last].filter(Boolean).join("/") + ".md"
        ),
        // versioned path
        !version
          ? undefined
          : path.resolve(
              process.cwd(),
              "../docs",
              [!version ? undefined : `versions/${last}`, ...nextdoc]
                .filter(Boolean)
                .join("/") + ".md"
            ),
      ]
        .filter((s): s is string => !!s)
        .map((p) => readFile(p))
    );

    const manifestContents = await bestPromise(
      [
        // versioned manifest
        path.resolve(
          process.cwd(),
          "../docs",
          [version ? `versions/${last}` : undefined, "manifest.yml"]
            .filter(Boolean)
            .join("/")
        ),
        // unversioned manifest
        !version
          ? undefined
          : path.resolve(process.cwd(), "../docs/manifest.yml"),
      ]
        .filter((s): s is string => !!s)
        .map((p) => readFile(p))
    );

    const manifest = yaml.load(manifestContents.toString()) as Manifest[];
    const ast = Markdoc.parse(fileContents.toString());
    const frontmatter = ast.attributes.frontmatter
      ? yaml.load(ast.attributes.frontmatter)
      : {};

    const content = JSON.parse(
      JSON.stringify(
        Markdoc.transform(ast, {
          ...markdocSchema,
          variables: {
            ...markdocSchema.variables,
            frontmatter,
          },
        })
      )
    );

    return {
      props: {
        manifest,
        content,
        version: (version ? last : null) ?? null,
      },
      revalidate: 1,
    };
  } catch {
    // 404 for file (temporarily)
    return {
      notFound: true,
    };
  }
};
