"use client";

import { createPusherClient } from "@/lib/pusher-client";
import { OrderStatus } from "@/lib/order-state-machine";
import { useEffect, useMemo, useState } from "react";

const steps = [
  { status: OrderStatus.PENDING, label: "Pending" },
  { status: OrderStatus.CONFIRMED, label: "Confirmed" },
  { status: OrderStatus.PREPARING, label: "Preparing" },
  { status: OrderStatus.OUT_FOR_DELIVERY, label: "Out for Delivery" },
  { status: OrderStatus.DELIVERED, label: "Delivered" },
];

const progressWidthClassByStep = [
  "w-[20%]",
  "w-[40%]",
  "w-[60%]",
  "w-[80%]",
  "w-full",
];

const OrderTrackingClient = ({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: number;
}) => {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const pusher = createPusherClient();
    if (!pusher) {
      return;
    }

    const channel = pusher.subscribe(`order-${orderId}`);

    const onUpdate = (payload: { orderId: string; status: number }) => {
      if (payload.orderId === orderId) {
        setStatus(payload.status);
      }
    };

    channel.bind("order-status-updated", onUpdate);

    return () => {
      channel.unbind("order-status-updated", onUpdate);
      pusher.unsubscribe(`order-${orderId}`);
      pusher.disconnect();
    };
  }, [orderId]);

  const activeIndex = useMemo(() => {
    return steps.findIndex((step) => step.status === status);
  }, [status]);

  const isCancelled = status === OrderStatus.CANCELLED;

  const progressWidthClass =
    activeIndex >= 0 ? progressWidthClassByStep[activeIndex] : "w-0";

  return (
    <section className="rounded-xl border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Live Order Tracking</h2>

      {isCancelled ? (
        <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-700">
          This order has been cancelled.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full bg-primary transition-all duration-300 ${progressWidthClass}`}
            />
          </div>

          <ol className="grid gap-2 sm:grid-cols-5">
            {steps.map((step, index) => {
              const completed = index <= activeIndex;

              return (
                <li
                  key={step.status}
                  className={`rounded-lg border px-3 py-2 text-center text-xs font-medium ${
                    completed
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {step.label}
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
};

export default OrderTrackingClient;
