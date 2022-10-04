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
      <div className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 w-full flex-row items-center justify-between">
            <div className="flex w-full flex-row items-center">
              <div className="item-center flex flex-shrink-0 flex-grow flex-row">
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
                        <a className="text-sm text-gray-500 transition hover:text-gray-900">
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
        <header className="border-b border-b-gray-100 bg-white">
          <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                {links.map((item) => (
                  <Link href={item.href} key={item.name}>
                    <a
                      className={cx(
                        item.current
                          ? "border-b-primary-400 border-b-2"
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
            <div className="border-b border-b-gray-100 bg-white">
              <div
                className={cx(
                  "mx-auto max-w-6xl pt-8 pb-12 sm:px-6 lg:px-8",
                  headerClassName
                )}
              >
                {header}
              </div>
            </div>
          ) : null}
          <div className="border-b border-b-gray-100 bg-gray-50 pb-12">
            <div className="mx-auto max-w-6xl pt-6 sm:px-6 lg:px-8">
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
