"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { ActionResponse } from "@/types/action-response";
import { addCartItem } from "@/redux/features/cartSlice";
import { useAppDispatch } from "@/redux/hooks";
import { ShoppingBag, Clock3, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type UserOrder = {
  id: string;
  total: number;
  status: number;
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      image: string;
      basePrice: number;
    };
  }>;
};

const timelineSteps = [0, 1, 2, 3, 4];

const getEstimatedDelivery = (createdAt: string) => {
  const base = new Date(createdAt).getTime();
  const eta = new Date(base + 40 * 60 * 1000);
  return eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const OrderHistoryPanel = ({ locale }: { locale: string }) => {
  const t = useTranslations("profile");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const statusLabels = useMemo(
    () => ({
      0: t("orders.status.pending"),
      1: t("orders.status.paid"),
      2: t("orders.status.preparing"),
      3: t("orders.status.delivery"),
      4: t("orders.status.delivered"),
    }),
    [t],
  );

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch("/api/orders", { cache: "no-store" });
        const data = (await response.json()) as ActionResponse<UserOrder[]>;
        if (!response.ok) {
          throw new Error(!data.success ? data.error : "Failed");
        }

        if (!data.success) {
          throw new Error(data.error || "Failed");
        }

        setOrders(data.data);
      } catch {
        toast.error(t("orders.loadError"), {
          className: "bg-red-500 text-white",
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [t]);

  const handleReorder = (order: UserOrder) => {
    if (!order.orderItems.length) return;

    order.orderItems.forEach((orderItem) => {
      for (let i = 0; i < orderItem.quantity; i += 1) {
        dispatch(
          addCartItem({
            id: orderItem.product.id,
            name: orderItem.product.name,
            image: orderItem.product.image,
            basePrice: Number(orderItem.product.basePrice || 0),
            quantity: 1,
            extras: [],
          }),
        );
      }
    });

    toast.success(t("orders.reorderSuccess"), {
      className: "bg-green-500 text-white",
    });
    router.push(`/${locale}/cart`);
  };

  return (
    <section className="mt-12 rounded-3xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            {t("orders.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("orders.subtitle")}
          </p>
        </div>
        <ShoppingBag className="h-5 w-5 text-primary" />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("orders.loading")}</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("orders.empty")}</p>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const activeStatus = Math.min(Math.max(order.status, 0), 4);
            return (
              <article
                key={order.id}
                className="rounded-2xl border border-border/70 p-5 bg-white/70"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(Number(order.total || 0))}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      {statusLabels[activeStatus as 0 | 1 | 2 | 3 | 4]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock3 className="h-4 w-4" />
                  <span>
                    {t("orders.etaPrefix")}{" "}
                    {getEstimatedDelivery(order.createdAt)}
                  </span>
                  <Truck className="h-4 w-4 ml-1" />
                </div>

                <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                  {timelineSteps.map((step) => {
                    const completed = step <= activeStatus;
                    return (
                      <li
                        key={`${order.id}-${step}`}
                        className={`rounded-xl px-3 py-2 text-xs text-center border ${
                          completed
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "bg-muted/40 border-border text-muted-foreground"
                        }`}
                      >
                        {statusLabels[step as 0 | 1 | 2 | 3 | 4]}
                      </li>
                    );
                  })}
                </ol>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    {order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0,
                    )}{" "}
                    {t("orders.items")}
                  </p>
                  <Button
                    onClick={() => handleReorder(order)}
                    className="rounded-full"
                  >
                    {t("orders.reorder")}
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

export default OrderHistoryPanel;
