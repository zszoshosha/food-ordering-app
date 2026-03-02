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

import { Locale } from "@/i18n.config";
import { Languages } from "@/constants/enums";

// Lazy-loaded translation dictionaries for supported languages
const dictionaries = {
  ar: () => import("@/dictionaries/ar.json").then((module) => module.default),
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
};

/**
 * Loads and returns the translation dictionary for the given locale.
 * Falls back to English for any locale that isn't Arabic.
 */
const getTrans = async (locale: Locale) => {
  return locale === Languages.ARABIC ? dictionaries.ar() : dictionaries.en();
};

export default getTrans;
