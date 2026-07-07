/**
 * Locale Layout
 *
 * This layout wraps all pages under /[locale]/ (e.g., /en/menu, /ar/about).
 * It is responsible for:
 * 1. Validating that the locale in the URL is supported
 * 2. Loading the translation messages for that locale
 * 3. Providing translations to all child components via NextIntlClientProvider
 * 4. Setting the text direction (RTL for Arabic, LTR for others)
 * 5. Rendering the shared Header and Footer around page content
 */
import Footer from "@/components/footer";
import Header from "@/components/header";
import { locales } from "@/i18n/config";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://food-ordering-app-one-phi.vercel.app";

type LocaleLayoutParams = {
  locale: string;
};

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<LocaleLayoutParams>;
}>;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getPathnameFromHeaders = (requestHeaders: Headers): string => {
  const rawPath =
    requestHeaders.get("x-pathname") ||
    requestHeaders.get("next-url") ||
    requestHeaders.get("x-invoke-path") ||
    "/";

  const pathWithoutQuery = rawPath.split("?")[0] || "/";
  return pathWithoutQuery.startsWith("/")
    ? pathWithoutQuery
    : "/" + pathWithoutQuery;
};

const stripLocalePrefix = (pathname: string): string => {
  const segments = pathname.split("/").filter(Boolean);
  if (!segments.length) {
    return "/";
  }

  const firstSegment = segments[0];
  const isLocaleSegment = locales.includes(
    firstSegment as (typeof locales)[number],
  );

  const rest = isLocaleSegment ? segments.slice(1) : segments;
  return rest.length ? "/" + rest.join("/") : "/";
};

const buildLocalizedAbsoluteUrl = (
  baseUrl: string,
  locale: string,
  suffixPath: string,
) => {
  const normalizedBase = trimTrailingSlash(baseUrl);
  const normalizedSuffix = suffixPath === "/" ? "" : suffixPath;
  return normalizedBase + "/" + locale + normalizedSuffix;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleLayoutParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const requestHeaders = await headers();
  const pathname = getPathnameFromHeaders(requestHeaders);
  const suffixPath = stripLocalePrefix(pathname);

  const languages = Object.fromEntries(
    locales.map((supportedLocale) => [
      supportedLocale,
      buildLocalizedAbsoluteUrl(SITE_URL, supportedLocale, suffixPath),
    ]),
  );

  return {
    alternates: {
      canonical: buildLocalizedAbsoluteUrl(SITE_URL, locale, suffixPath),
      languages: {
        ...languages,
        "x-default": buildLocalizedAbsoluteUrl(
          SITE_URL,
          locales[0],
          suffixPath,
        ),
      },
    },
    verification: {
      google: "O8Z4g9fWMHQRFM0wOIrvlJhRXDHQ4RUzbFWRvd86o00",
    },
  };
}

/**
 * Generate static params for all supported locales.
 * This enables Next.js to statically generate pages for each locale at build time.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // If the locale is not in our supported list, show 404
  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  // Set the locale for server-side rendering of this request
  setRequestLocale(locale);
  // Load all translation messages for the current locale
  const messages = await getMessages();
  const isArabic = locale === "ar";

  return (
    // NextIntlClientProvider makes translations available to all client components
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* Set text direction: RTL for Arabic, LTR for all other languages */}
      <div dir={isArabic ? "rtl" : "ltr"}>
        <Header />
        {children}
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}
