import DeliveryDashboard from "@/components/delivery/DeliveryDashboard";
import { requireAuth } from "@/lib/requireAuth";

/**
 * Delivery workspace for riders/staff handling out-for-delivery orders.
 */
const DeliveryPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  await requireAuth(locale, "DELIVERY");

  return (
    <main className="min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Operations
          </p>
          <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
            Delivery Dashboard
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            Handle live drop-offs, complete deliveries, and keep order flow
            moving.
          </p>
        </div>

        <DeliveryDashboard />
      </div>
    </main>
  );
};

export default DeliveryPage;
