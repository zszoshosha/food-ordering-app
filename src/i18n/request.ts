/**
 * i18n Request Configuration
 *
 * This file configures next-intl for server-side locale resolution.
 * It defines the supported locales, validates the requested locale,
 * and dynamically loads the corresponding translation JSON file.
 *
 * Supported locales: English (en), Arabic (ar)
 */
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

// Define all supported locales as a const tuple for type safety
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

// Default fallback locale when no match is found
export const defaultLocale: Locale = "en";

/**
 * Configures the request-level i18n settings.
 * Validates the locale from the URL and loads the matching translation messages.
 * Falls back to the default locale if the requested one is unsupported.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  // Validate locale — fall back to default if not in supported list
  const locale = locales.includes(requestedLocale as Locale)
    ? (requestedLocale as Locale)
    : defaultLocale;

  return {
    locale,
    // Dynamically import the JSON translation file for the resolved locale
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
