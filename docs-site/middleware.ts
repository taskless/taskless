import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname == "/") {
    return NextResponse.redirect(new URL("/docs/welcome", req.url));
  }
  if (pathname == "/docs") {
    return NextResponse.redirect(new URL("/docs/welcome", req.url));
  }
  return NextResponse.next();
}
