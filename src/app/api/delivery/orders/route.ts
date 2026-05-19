import {
  getDeliveryOrders,
  markOrderDelivered,
} from "@/server/Actions/Delivery";
import { NextResponse } from "next/server";

const getErrorStatus = (
  error: string,
  validationErrors?: Record<string, string[]>,
) => {
  if (error === "Unauthorized") return 401;
  if (validationErrors) return 400;
  if (/not found/i.test(error)) return 404;
  if (/only out-for-delivery|cannot/i.test(error)) return 409;
  if (/failed/i.test(error)) return 500;
  return 400;
};

/**
 * Returns current delivery queue orders.
 */
export async function GET() {
  const result = await getDeliveryOrders();

  if (!result.success) {
    return NextResponse.json(result, {
      status: getErrorStatus(result.error, result.validationErrors),
    });
  }

  return NextResponse.json(result);
}

/**
 * Marks a queued order as delivered.
 */
export async function PATCH(req: Request) {
  try {
    const payload = (await req.json()) as { orderId?: string };
    const result = await markOrderDelivered(payload.orderId ?? "");

    if (!result.success) {
      return NextResponse.json(result, {
        status: getErrorStatus(result.error, result.validationErrors),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update delivery order", error);
    return NextResponse.json(
      { success: false, error: "Failed to update delivery order." },
      { status: 500 },
    );
  }
}
