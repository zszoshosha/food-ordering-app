/**
 * Internationalization Proxy
 *
 * This proxy intercepts all incoming requests and handles locale detection/routing.
 * It automatically redirects users to their preferred locale (e.g., /en/menu, /ar/menu)
 * and ensures every route is prefixed with a valid locale segment.
 *
 * How it works:
 * 1. Checks the URL for a locale prefix (en, ar)
 * 2. If no locale is found, redirects to the default locale (English)
 * 3. The "always" prefix strategy means URLs always include the locale (e.g., /en/about)
 */
import createMiddleware from "next-intl/middleware";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n/config";

// Inlined from ./constants/enums — keep proxy free of local module graph for Edge tracing.
const Routes = {
  PROFILE: "profile",
  ADMIN: "admin",
  UNAUTHORIZED: "unauthorized",
} as const;

// Inlined from ./lib/auth/roles
const AUTH_ROLES = {
  GUEST: "GUEST",
  CUSTOMER: "CUSTOMER",
  ADMIN: "ADMIN",
} as const;

const isAdminRole = (role?: string | null): boolean =>
  role === AUTH_ROLES.ADMIN;

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix in URLs (e.g., /en/menu instead of /menu)
  localePrefix: "always",
});

const publicPaths = new Set(["/", "/login", "/register"]);
const legacyAuthPaths = new Set(["/auth/signin", "/auth/signup"]);

const shouldBypassProxy = (pathname: string) => {
  if (pathname.startsWith("/_next")) {
    return true;
  }

  if (pathname.startsWith("/api")) {
    return true;
  }

  // Skip requests for files like .js, .css, .woff2, images, etc.
  if (/\.[^/]+$/.test(pathname)) {
    return true;
  }

  return false;
};

const routeStartsWith = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

const normalizePath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const hasLocalePrefix = locales.includes(
    segments[0] as (typeof locales)[number],
  );

  if (!hasLocalePrefix) {
    return segments.length ? `/${segments.join("/")}` : "/";
  }

  const routeSegments = segments.slice(1);
  return routeSegments.length ? `/${routeSegments.join("/")}` : "/";
};

const getLocaleFromPath = (pathname: string) => {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return locales.includes(firstSegment as (typeof locales)[number])
    ? firstSegment
    : defaultLocale;
};

export default async function proxy(request: NextRequest) {
  if (shouldBypassProxy(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);
  const locale = getLocaleFromPath(request.nextUrl.pathname);
  const normalizedPath = normalizePath(request.nextUrl.pathname);

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

  // Everything except public routes is private.
  const signInUrl = new URL(`/${locale}/login`, request.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(signInUrl);
}

export const config = {
  // Match all page routes (with or without locale) while excluding API/static assets.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
