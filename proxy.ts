import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { guestOnlyRoutes, protectedRoutes } from "@/lib/constants";
import { getAuthSecret } from "@/lib/env";

function isRouteIncluded(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: getAuthSecret(),
  });

  const isGuestOnly = isRouteIncluded(pathname, guestOnlyRoutes);
  const isProtected = isRouteIncluded(pathname, protectedRoutes);

  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/admin" || pathname.startsWith("/admin/")) && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
