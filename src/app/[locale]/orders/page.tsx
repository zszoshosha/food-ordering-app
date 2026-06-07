import { AUTH_ROLES } from "@/lib/auth/roles";
import { formatCurrency } from "@/lib/formatters";
import { OrderStatus } from "@/lib/order-state-machine";
import { requireAuth } from "@/lib/requireAuth";
import { getUserOrders } from "@/server/Actions/Order";
import Link from "@/components/link";

const statusStyles: Record<number, string> = {
  [OrderStatus.PENDING]: "bg-amber-100 text-amber-800",
  [OrderStatus.CONFIRMED]: "bg-blue-100 text-blue-800",
  [OrderStatus.PREPARING]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.OUT_FOR_DELIVERY]: "bg-indigo-100 text-indigo-800",
  [OrderStatus.DELIVERED]: "bg-emerald-100 text-emerald-800",
  [OrderStatus.CANCELLED]: "bg-rose-100 text-rose-800",
};

const statusLabel: Record<number, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.CONFIRMED]: "Confirmed",
  [OrderStatus.PREPARING]: "Preparing",
  [OrderStatus.OUT_FOR_DELIVERY]: "Out for Delivery",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
};

const OrdersPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const session = await requireAuth(locale, AUTH_ROLES.CUSTOMER);

  if (!session.user.id) {
    return (
      <main className="min-h-screen p-6 md:p-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
          Unable to load orders for this account.
        </div>
      </main>
    );
  }

  const result = await getUserOrders(session.user.id);

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-3xl font-bold">Your Orders</h1>

        {!result.success ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
            {result.error}
          </p>
        ) : result.data.length === 0 ? (
          <p className="rounded-lg border bg-card p-4 text-muted-foreground">
            You have no orders yet.
          </p>
        ) : (
          <div className="space-y-4">
            {result.data.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(order.total)}
                    </p>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.status] ?? "bg-muted text-foreground"}`}
                    >
                      {statusLabel[order.status] ?? "Unknown"}
                    </span>
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {order.orderItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between"
                    >
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4">
                  <Link
                    href={`/${locale}/orders/${order.id}/track`}
                    className="inline-flex rounded-md border px-3 py-2 text-sm font-medium"
                  >
                    Track order
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default OrdersPage;
