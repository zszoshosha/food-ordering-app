import {
  getDeliveryOrders,
  markOrderDelivered,
} from "@/server/Actions/Delivery";
import { NextResponse } from "next/server";

/**
 * Returns current delivery queue orders.
 */
export async function GET() {
  try {
    const orders = await getDeliveryOrders();
    return NextResponse.json({ items: orders });
  } catch (error) {
    console.error("Failed to fetch delivery orders", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch delivery orders." },
      { status: 500 },
    );
  }
}

/**
 * Marks a queued order as delivered.
 */
export async function PATCH(req: Request) {
  try {
    const payload = (await req.json()) as { orderId?: string };
    const result = await markOrderDelivered(payload.orderId ?? "");

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(result.item, { status: result.status });
  } catch (error) {
    console.error("Failed to update delivery order", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update delivery order." },
      { status: 500 },
    );
  }
}
