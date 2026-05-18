import { requireAuth } from "@/lib/requireAuth";
import CartPageClient from "./_components/CartPageClient";

/**
 * Localized cart page that renders translated cart content.
 */
const CartPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  await requireAuth(locale);

  return <CartPageClient />;
};

export default CartPage;
