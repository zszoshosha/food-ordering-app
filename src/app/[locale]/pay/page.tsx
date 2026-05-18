import { requireAuth } from "@/lib/requireAuth";
import PayPageClient from "./_components/PayPageClient";

/**
 * Localized checkout page for collecting customer details and showing totals.
 */
const PayPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  await requireAuth(locale);

  return <PayPageClient locale={locale} />;
};

export default PayPage;
