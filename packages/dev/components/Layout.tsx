import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React, { PropsWithChildren } from "react";

interface LayoutProps {
  title: string;
  route?: string;
}

export const Layout: React.FC<PropsWithChildren<LayoutProps>> = ({
  title,
  route,
  children,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="flex flex-col bg-gray-200" style={{ minHeight: "100vh" }}>
        <div className="w-full border-b border-b-gray-300 bg-white">
          <nav className="pt-3">
            <div className="flex flex-row items-center max-w-5xl mx-auto">
              <Link href="/">
                <a className="flex flex-row items-center">
                  <Image
                    src="/logo/taskless-dev.svg"
                    width="40"
                    height="40"
                    alt="Taskless Development"
                    className="logo"
                  />
                  <p className="text-xl font-bold">Development Server</p>
                </a>
              </Link>
              <div className="flex-grow" />
              <Link href="https://taskless.io/docs">
                <a className="mr-2">Docs</a>
              </Link>
              <Link href="https://taskless.io">
                <a>Taskless.io</a>
              </Link>
            </div>
            <div className="flex flex-row text-sm space-x-3 mt-2 max-w-5xl mx-auto">
              <Link href="/">
                <a
                  className={`pb-2 mb-1 border-b-2 border-white ${
                    route === "/" ? "!border-gray-800" : ""
                  }`}
                >
                  Overview
                </a>
              </Link>
              <Link href="/scheduled">
                <a
                  className={`pb-2 mb-1 border-b-2 border-white ${
                    route === "/scheduled" ? "!border-gray-800" : ""
                  }`}
                >
                  Scheduled
                </a>
              </Link>
              <Link href="/completed">
                <a
                  className={`pb-2 mb-1 border-b-2 border-white ${
                    route === "/completed" ? "!border-gray-800" : ""
                  }`}
                >
                  Completed
                </a>
              </Link>
            </div>
          </nav>
        </div>
        <div className="w-full max-w-5xl mx-auto content-start pt-3 flex flex-col space-y-3">
          {children}
        </div>
      </div>
    </>
  );
};
