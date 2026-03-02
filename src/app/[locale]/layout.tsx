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
import { locales } from "@/i18n/request";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

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
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
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
