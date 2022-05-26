import Head from "next/head";
import Link from "next/link";
import React, { PropsWithChildren, useMemo } from "react";
import { useRouter } from "next/router";
import { Logo } from "./Logo";
import { Slash } from "@taskless/ui";
import cx from "classnames";

const topNav = [
  {
    name: "docs",
    href: "https://taskless.io/docs",
  },
  {
    name: "taskless.io",
    target: "_blank",
    href: "https://taskless.io",
  },
];

const useNavigationLinks = () => {
  const r = useRouter();
  const links = useMemo(() => {
    const rpath = r.asPath.split("?")[0];
    return [
      { name: "Jobs", href: "/", current: false },
      { name: "Logs", href: "/logs", current: false },
    ].map((link) => {
      link.current = rpath === link.href;
      return link;
    });
  }, [r]);
  return links;
};

interface LayoutProps {
  title: string;
  header?: JSX.Element;
  headerClassName?: string;
}

export const Layout: React.FC<PropsWithChildren<LayoutProps>> = ({
  title,
  header,
  headerClassName,
  children,
}) => {
  const links = useNavigationLinks();
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="min-h-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 w-full">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0 flex flex-row item-center flex-grow">
                <Link href="/">
                  <a>
                    <Logo className="h-9 w-9" />
                  </a>
                </Link>
                <Slash className="h-9 stroke-gray-300" />
                <span className="flex items-center">development server</span>
              </div>
              <div>
                <div className="ml-4 flex items-center justify-end md:ml-6">
                  <div className="flex items-center gap-3">
                    {topNav.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <a className="text-sm text-gray-500 hover:text-gray-900 transition">
                          {item.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <header className="bg-white border-b border-b-gray-100">
          <div className="max-w-6xl mx-auto pt-4 px-4 sm:px-6 lg:px-8">
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                {links.map((item) => (
                  <Link href={item.href} key={item.name}>
                    <a
                      className={cx(
                        item.current
                          ? "border-b-2 border-b-brand-400"
                          : "rounded-md hover:bg-gray-100",
                        "px-3 py-2 text-sm font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </header>
        <main>
          {header ? (
            <div className="bg-white border-b border-b-gray-100">
              <div
                className={cx(
                  "max-w-6xl mx-auto sm:px-6 lg:px-8 pt-8 pb-12",
                  headerClassName
                )}
              >
                {header}
              </div>
            </div>
          ) : null}
          <div className="bg-gray-50 pb-12 border-b border-b-gray-100">
            <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 pt-6">
              {/* Replace with your content */}
              {children}
              {/* /End replace */}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};
