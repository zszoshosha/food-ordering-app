/**
 * Server-side utility to extract the current locale from the request URL.
 *
 * Reads the "x-url" header (set by proxy) and parses out the locale
 * segment from the URL path. This is used in server components that need
 * to know the current language (e.g., to load translations).
 *
 * Example: URL "/en/auth/signin" → locale = "en"
 */
import { Locale } from "@/i18n/config";
import { headers } from "next/headers";

export const getCurrentLocale = async () => {
  const url = (await headers()).get("x-url");
  // The locale is the 3rd segment in the URL path (after host)
  const locale = url?.split("/")[3] as Locale;
  return locale;
};
