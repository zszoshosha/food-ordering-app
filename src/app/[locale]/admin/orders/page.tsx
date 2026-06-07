import { ADMIN_ORDER_STATUS_OPTIONS } from "@/constants/admin";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { requireAuth } from "@/lib/requireAuth";
import { updateAdminOrderStatus, getAdminOrders } from "@/server/Actions/Admin";
import { AdminOrderStatus } from "@/types/admin";
import { revalidatePath } from "next/cache";

const ACTIVE_ORDER_STATUSES = new Set<number>([
  AdminOrderStatus.PENDING,
  AdminOrderStatus.CONFIRMED,
  AdminOrderStatus.PREPARING,
  AdminOrderStatus.OUT_FOR_DELIVERY,
]);

const statusBadgeClass: Record<number, string> = {
  [AdminOrderStatus.PENDING]: "bg-amber-100 text-amber-800 border-amber-200",
  [AdminOrderStatus.CONFIRMED]: "bg-blue-100 text-blue-800 border-blue-200",
  [AdminOrderStatus.PREPARING]:
    "bg-yellow-100 text-yellow-800 border-yellow-200",
  [AdminOrderStatus.OUT_FOR_DELIVERY]:
    "bg-indigo-100 text-indigo-800 border-indigo-200",
  [AdminOrderStatus.DELIVERED]:
    "bg-emerald-100 text-emerald-800 border-emerald-200",
  [AdminOrderStatus.CANCELLED]: "bg-rose-100 text-rose-800 border-rose-200",
};

const OrdersManagementPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  await requireAuth(locale, AUTH_ROLES.ADMIN);

  const result = await getAdminOrders({
    page: 1,
    pageSize: 100,
    status: "ALL",
    search: "",
  });

  const activeOrders = result.success
    ? result.data.items.filter((order) =>
        ACTIVE_ORDER_STATUSES.has(order.status),
      )
    : [];

  const updateStatusAction = async (formData: FormData) => {
    "use server";

    const orderId = String(formData.get("orderId") ?? "");
    const status = Number(formData.get("status") ?? -1);

    await updateAdminOrderStatus(orderId, status);
    revalidatePath(`/${locale}/admin/orders`);
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold">Admin Orders Management</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage active orders and update status in real time.
          </p>
        </header>

        {!result.success ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-700">
            Failed to load orders: {result.error}
          </p>
        ) : activeOrders.length === 0 ? (
          <p className="rounded-lg border bg-card p-4 text-muted-foreground">
            No active orders right now.
          </p>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.userName} ({order.userEmail})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.address}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusBadgeClass[order.status] ?? "bg-muted text-foreground border-border"}`}
                    >
                      {ADMIN_ORDER_STATUS_OPTIONS.find(
                        (opt) => opt.value === order.status,
                      )?.label ?? "Unknown"}
                    </span>
                    <p className="mt-2 text-sm font-semibold">
                      ${Number(order.total).toFixed(2)}
                    </p>
                  </div>
                </div>

                <form
                  action={updateStatusAction}
                  className="mt-4 flex items-center gap-3"
                >
                  <input type="hidden" name="orderId" value={order.id} />
                  <label
                    htmlFor={`status-${order.id}`}
                    className="text-sm font-medium"
                  >
                    Update status
                  </label>
                  <select
                    id={`status-${order.id}`}
                    name="status"
                    defaultValue={order.status}
                    className="rounded-md border px-3 py-2 text-sm"
                  >
                    {ADMIN_ORDER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  >
                    Save
                  </button>
                </form>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default OrdersManagementPage;
