/**
 * Server-Only Translation Loader
 *
 * This module provides a way to load translation dictionaries on the server side.
 * It uses dynamic imports to lazily load the JSON translation files for the
 * requested locale. Marked as "server-only" to prevent client-side bundling.
 *
 * Note: This is a separate translation system from next-intl, used for
 * server components that need typed translation objects (e.g., form fields).
 */
import "server-only";

import { Locale } from "@/i18n/config";

// Lazy-loaded translation dictionaries for server-side typed translations
// These are separate from i18n/locales (used by next-intl for client-side).
// The dictionaries/ folder follows the Translations type for form fields, auth, admin, etc.
const dictionaries = {
  ar: () => import("@/dictionaries/ar.json").then((module) => module.default),
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
};

/**
 * Loads and returns the translation dictionary for the given locale.
 * Falls back to English for any unsupported locale.
 */
const getTrans = async (locale: Locale) => {
  const loader = dictionaries[locale as keyof typeof dictionaries] || dictionaries.en;
  return loader();
};

export default getTrans;
