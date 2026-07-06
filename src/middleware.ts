import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { AUTH_ROLES, isAdminRole } from "@/lib/auth/roles";

const locales = ["ar", "en"] as const;
const defaultLocale = "ar" as const;

const Routes = {
  PROFILE: "profile",
  ADMIN: "admin",
  CHECKOUT: "checkout",
  UNAUTHORIZED: "unauthorized",
} as const;

const intlMiddleware = createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: "always",
});

const publicPaths = new Set([
  // المسارات الأساسية بدون لغة
  "/",
  "/login",
  "/register",
  "/menu",
  "/about",
  "/contact",

  // مسارات اللغة الإنجليزية (en)
  "/en",
  "/en/login",
  "/en/register",
  "/en/menu",
  "/en/about",
  "/en/contact",

  // مسارات اللغة العربية (ar)
  "/ar",
  "/ar/login",
  "/ar/register",
  "/ar/menu",
  "/ar/about",
  "/ar/contact",
]);
const legacyAuthPaths = new Set(["/auth/signin", "/auth/signup"]);

const shouldBypassProxy = (pathname: string) =>
  pathname.startsWith("/_next") ||
  pathname.startsWith("/api") ||
  /\.[^/]+$/.test(pathname);

const routeStartsWith = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

const normalizePath = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const hasLocale = (locales as readonly string[]).includes(segments[0]);
  const routeSegments = hasLocale ? segments.slice(1) : segments;
  return routeSegments.length ? `/${routeSegments.join("/")}` : "/";
};

const getLocaleFromPath = (pathname: string) => {
  const first = pathname.split("/").filter(Boolean)[0];
  return (locales as readonly string[]).includes(first) ? first : defaultLocale;
};

const buildCallbackUrl = (request: NextRequest) =>
  `${request.nextUrl.pathname}${request.nextUrl.search}`;

const buildLocaleUrl = (
  locale: string,
  pathname: string,
  request: NextRequest,
) => new URL(`/${locale}${pathname}`, request.url);

const buildLoginRedirect = (request: NextRequest, locale: string) => {
  const url = buildLocaleUrl(locale, "/login", request);
  url.searchParams.set("callbackUrl", buildCallbackUrl(request));
  return url;
};

const buildUnauthorizedRedirect = (request: NextRequest, locale: string) =>
  buildLocaleUrl(locale, `/${Routes.UNAUTHORIZED}`, request);

const isProtectedRoute = (pathname: string) =>
  routeStartsWith(pathname, `/${Routes.ADMIN}`) ||
  routeStartsWith(pathname, `/${Routes.CHECKOUT}`) ||
  routeStartsWith(pathname, `/${Routes.PROFILE}`);

const resolveToken = async (request: NextRequest) => {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token ?? null;
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldBypassProxy(pathname)) return NextResponse.next();

  const locale = getLocaleFromPath(pathname);
  const normalizedPath = normalizePath(pathname);

  if (legacyAuthPaths.has(normalizedPath)) {
    const destination = normalizedPath.endsWith("signin")
      ? "/login"
      : "/register";
    return NextResponse.redirect(buildLocaleUrl(locale, destination, request));
  }

  const token = await resolveToken(request);

  if (
    token &&
    (normalizedPath === "/login" || normalizedPath === "/register")
  ) {
    return NextResponse.redirect(
      buildLocaleUrl(locale, `/${Routes.PROFILE}`, request),
    );
  }

  if (isProtectedRoute(normalizedPath)) {
    if (!token) {
      return NextResponse.redirect(buildLoginRedirect(request, locale));
    }

    if (
      routeStartsWith(normalizedPath, `/${Routes.ADMIN}`) &&
      !isAdminRole(token.role)
    ) {
      return NextResponse.redirect(buildUnauthorizedRedirect(request, locale));
    }
  }

  if (publicPaths.has(normalizedPath)) {
    return intlMiddleware(request);
  }

  if (token) {
    return intlMiddleware(request);
  }

  return NextResponse.redirect(buildLoginRedirect(request, locale));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
