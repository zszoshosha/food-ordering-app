import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const locales = ["ar", "en"] as const;
const defaultLocale = "ar" as const;

const Routes = {
  PROFILE: "profile",
  ADMIN: "admin",
  UNAUTHORIZED: "unauthorized",
} as const;

const intlMiddleware = createMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  localePrefix: "always",
});

const publicPaths = new Set(["/", "/login", "/register"]);
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

// ✅ Edge-safe JWT decode — لا يلمس Prisma أبداً
async function getTokenPayload(request: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) return null;

    const cookieName =
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    const token = request.cookies.get(cookieName)?.value;
    if (!token) return null;

    const secret_key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secret_key);
    return payload as { role?: string } | null;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldBypassProxy(pathname)) return NextResponse.next();

  const locale = getLocaleFromPath(pathname);
  const normalizedPath = normalizePath(pathname);

  if (legacyAuthPaths.has(normalizedPath)) {
    const destination = normalizedPath.endsWith("signin")
      ? "/login"
      : "/register";
    return NextResponse.redirect(
      new URL(`/${locale}${destination}`, request.url),
    );
  }

  const token = await getTokenPayload(request);

  if (
    token &&
    (normalizedPath === "/login" || normalizedPath === "/register")
  ) {
    return NextResponse.redirect(
      new URL(`/${locale}/${Routes.PROFILE}`, request.url),
    );
  }

  if (publicPaths.has(normalizedPath)) {
    return intlMiddleware(request);
  }

  if (token) {
    if (
      routeStartsWith(normalizedPath, `/${Routes.ADMIN}`) &&
      token.role !== "ADMIN"
    ) {
      return NextResponse.redirect(
        new URL(`/${locale}/${Routes.UNAUTHORIZED}`, request.url),
      );
    }
    return intlMiddleware(request);
  }

  const signInUrl = new URL(`/${locale}/login`, request.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
