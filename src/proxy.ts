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
import { Pages, Routes, UserRole } from "./constants/enums";
import { locales, defaultLocale } from "./i18n/request";

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix in URLs (e.g., /en/menu instead of /menu)
  localePrefix: "always",
});

const protectedRoutes = new Set([
  Routes.PROFILE,
  Routes.ADMIN,
  Routes.DELIVERY,
  "pay",
]);
const authRoutes = new Set([
  `${Routes.AUTH}/${Pages.LOGIN}`,
  `${Routes.AUTH}/${Pages.REGISTER}`,
]);

const getRouteSegment = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const firstSegment = segments[0];
  const hasLocalePrefix = locales.includes(
    firstSegment as (typeof locales)[number],
  );

  return hasLocalePrefix ? (segments[1] ?? null) : firstSegment;
};

const getLocaleFromPath = (pathname: string) => {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return locales.includes(firstSegment as (typeof locales)[number])
    ? firstSegment
    : defaultLocale;
};

export default async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  const routeSegment = getRouteSegment(request.nextUrl.pathname);
  const locale = getLocaleFromPath(request.nextUrl.pathname);

  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const hasLocalePrefix = locales.includes(
    segments[0] as (typeof locales)[number],
  );
  const normalizedPath = hasLocalePrefix
    ? segments.slice(1).join("/")
    : segments.join("/");

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  /**
   * Access matrix (route -> behavior):
   * - /auth/signin, /auth/signup:
   *   - guest => allow
   *   - signed-in USER => redirect to /{locale}/profile
   *   - signed-in ADMIN => redirect to /{locale}/admin
   * - protected routes (/profile, /pay, /admin):
   *   - guest => redirect to /{locale}/auth/signin?callbackUrl=...
   *   - signed-in USER => allow /profile and /pay, redirect /admin to /profile
   *   - signed-in ADMIN => allow all protected routes
   * - all other routes: allow
   */

  if (authRoutes.has(normalizedPath)) {
    // Signed-in users should not access sign-in/sign-up pages.
    if (token?.role === UserRole.ADMIN) {
      return NextResponse.redirect(
        new URL(`/${locale}/${Routes.ADMIN}`, request.url),
      );
    }

    if (token?.role === UserRole.DELIVERY) {
      return NextResponse.redirect(
        new URL(`/${locale}/${Routes.DELIVERY}`, request.url),
      );
    }

    if (token) {
      return NextResponse.redirect(
        new URL(`/${locale}/${Routes.PROFILE}`, request.url),
      );
    }

    return response;
  }

  if (!routeSegment || !protectedRoutes.has(routeSegment)) {
    return response;
  }

  if (token) {
    // Signed-in regular users cannot access admin pages.
    if (routeSegment === Routes.ADMIN && token.role !== UserRole.ADMIN) {
      return NextResponse.redirect(
        new URL(`/${locale}/${Routes.PROFILE}`, request.url),
      );
    }

    // Only delivery and admin users can access delivery operations pages.
    if (
      routeSegment === Routes.DELIVERY &&
      token.role !== UserRole.DELIVERY &&
      token.role !== UserRole.ADMIN
    ) {
      return NextResponse.redirect(
        new URL(`/${locale}/${Routes.PROFILE}`, request.url),
      );
    }

    return response;
  }

  // Guests attempting protected routes are redirected to sign-in.
  const signInUrl = new URL(
    `/${locale}/${Routes.AUTH}/${Pages.LOGIN}`,
    request.url,
  );
  signInUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(signInUrl);
}

export const config = {
  // Match all page routes (with or without locale) while excluding API/static assets.
  // This allows paths like /auth/signup to be redirected to /en/auth/signup.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
