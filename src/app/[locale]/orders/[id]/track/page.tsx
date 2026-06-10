import { AUTH_ROLES } from "@/lib/auth/roles";
import { formatCurrency } from "@/lib/formatters";
import { requireAuth } from "@/lib/requireAuth";
import { getUserOrderById } from "@/server/Actions/Order";
import OrderTrackingClient from "./_components/OrderTrackingClient";

const TrackOrderPage = async ({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) => {
  const { locale, id } = await params;
  const session = await requireAuth(locale, AUTH_ROLES.CUSTOMER);

  if (!session.user.id) {
    return (
      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Unable to load tracking information for this account.
        </div>
      </main>
    );
  }

  const result = await getUserOrderById(session.user.id, id);

  if (!result.success || !result.data) {
    return (
      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          {result.success ? "Order not found." : result.error}
        </div>
      </main>
    );
  }

  const order = result.data;

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="rounded-xl border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">
            Track Order #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Created {new Date(order.createdAt).toLocaleString()}
          </p>
          <p className="mt-1 text-sm font-semibold">
            Total: {formatCurrency(order.total)}
          </p>
        </header>

        <OrderTrackingClient orderId={order.id} initialStatus={+order.status} />
      </div>
    </main>
  );
};

export default TrackOrderPage;
