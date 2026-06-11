/**
 * Internationalization & Auth Proxy (Middleware)
 * Completely isolated from the local module graph to fix Vercel Edge tracing (.nft.json error).
 */
import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// 1. Inlined i18n Config (To isolate the file completely)
const locales = ["en", "ar"] as const;
const defaultLocale = "en" as const;

// 2. Inlined Routes
const Routes = {
  PROFILE: "profile",
  ADMIN: "admin",
  UNAUTHORIZED: "unauthorized",
} as const;

// 3. Inlined Roles
const AUTH_ROLES = {
  GUEST: "GUEST",
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
} as const;

const isAdminRole = (role?: string | null): boolean =>
  role === AUTH_ROLES.ADMIN;

const intlMiddleware = createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: "always",
});

const publicPaths = new Set(["/", "/login", "/register"]);
const legacyAuthPaths = new Set(["/auth/signin", "/auth/signup"]);

const shouldBypassProxy = (pathname: string) => {
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return true;
  }
  if (/\.[^/]+$/.test(pathname)) {
    return true;
  }
  return false;
};

const routeStartsWith = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

const normalizePath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const hasLocalePrefix = (locales as readonly string[]).includes(segments[0]);

  if (!hasLocalePrefix) {
    return segments.length ? `/${segments.join("/")}` : "/";
  }

  const routeSegments = segments.slice(1);
  return routeSegments.length ? `/${routeSegments.join("/")}` : "/";
};

const getLocaleFromPath = (pathname: string) => {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return (locales as readonly string[]).includes(firstSegment)
    ? firstSegment
    : defaultLocale;
};

export default async function middleware(request: NextRequest) {
  if (shouldBypassProxy(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  const locale = getLocaleFromPath(request.nextUrl.pathname);
  const normalizedPath = normalizePath(request.nextUrl.pathname);

  // Safe JWT token retrieval for Edge Runtime
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (legacyAuthPaths.has(normalizedPath)) {
    const destination = normalizedPath.endsWith("signin") ? "/login" : "/register";
    return NextResponse.redirect(new URL(`/${locale}${destination}`, request.url));
  }

  if (publicPaths.has(normalizedPath)) {
    if (token && (normalizedPath === "/login" || normalizedPath === "/register")) {
      return NextResponse.redirect(
        new URL(`/${locale}/${Routes.PROFILE}`, request.url),
      );
    }
    return response;
  }

  if (token) {
    if (routeStartsWith(normalizedPath, `/${Routes.ADMIN}`) && !isAdminRole(token.role)) {
      return NextResponse.redirect(
        new URL(`/${locale}/${Routes.UNAUTHORIZED}`, request.url),
      );
    }
    return response;
  }

  const signInUrl = new URL(`/${locale}/login`, request.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};