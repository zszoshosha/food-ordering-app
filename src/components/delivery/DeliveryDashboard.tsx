"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { MapPinned, PackageCheck, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type DeliveryOrder = {
  id: string;
  address: string;
  total: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: Array<{
    quantity: number;
  }>;
};

const DELIVERY_AUTH_ERROR_MESSAGE =
  "You must be signed in as delivery staff or admin to access this queue.";

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDeliveryOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/delivery/orders", {
        cache: "no-store",
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(DELIVERY_AUTH_ERROR_MESSAGE);
        }

        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to load delivery queue.");
      }
      const data = (await response.json()) as { items: DeliveryOrder[] };
      setOrders(data.items);
    } catch (error) {
      console.error("Error fetching delivery orders", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load delivery queue.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOrders();
  }, []);

  const pendingCount = orders.length;
  const pendingRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders],
  );

  const markDelivered = async (orderId: string) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch("/api/delivery/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to mark order as delivered.");
      }

      setOrders((current) => current.filter((item) => item.id !== orderId));
      toast.success("Order marked as delivered.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to mark order as delivered.";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="mt-8 rounded-3xl border bg-card p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-foreground">Delivery Queue</h2>
        <Button variant="outline" onClick={fetchDeliveryOrders}>
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Open deliveries
          </p>
          <p className="mt-2 text-2xl font-semibold">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Queue value
          </p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCurrency(pendingRevenue)}
          </p>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Avg. handoff ETA
          </p>
          <p className="mt-2 text-2xl font-semibold">15-25 min</p>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Loading delivery orders...
        </p>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-background p-6 text-center">
          <PackageCheck className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            No orders are currently waiting for delivery.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const itemCount = order.orderItems.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );

            return (
              <article
                key={order.id}
                className="rounded-2xl border bg-background p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.user.name} - {order.user.email}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
                      <MapPinned className="h-4 w-4" />
                      {order.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {itemCount} items
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => markDelivered(order.id)}
                    disabled={updatingId === order.id}
                    className="rounded-full"
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    {updatingId === order.id ? "Updating..." : "Mark Delivered"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default DeliveryDashboard;
