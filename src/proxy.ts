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
import { locales, defaultLocale } from "./i18n/request";

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always use locale prefix in URLs (e.g., /en/menu instead of /menu)
  localePrefix: "always",
});

export const config = {
  // Match all page routes (with or without locale) while excluding API/static assets.
  // This allows paths like /auth/signup to be redirected to /en/auth/signup.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
