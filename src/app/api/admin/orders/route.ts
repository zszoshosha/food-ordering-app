import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "../../../../server/Actions/Admin";
import { NextRequest, NextResponse } from "next/server";

const getErrorStatus = (
  error: string,
  validationErrors?: Record<string, string[]>,
) => {
  if (error === "Unauthorized") return 401;
  if (validationErrors) return 400;
  if (/illegal order status transition/i.test(error)) return 409;
  if (/not found/i.test(error)) return 404;
  if (/failed/i.test(error)) return 500;
  return 400;
};

/**
 * Returns paginated orders for admin management.
 */
export async function GET(req: Request) {
  try {
    const request = req as NextRequest;
    const page = Number.parseInt(
      request.nextUrl.searchParams.get("page") ?? "1",
      10,
    );
    const pageSize = Number.parseInt(
      request.nextUrl.searchParams.get("pageSize") ?? "10",
      10,
    );
    const search = request.nextUrl.searchParams.get("search") ?? "";
    const status = request.nextUrl.searchParams.get("status") ?? "ALL";

    const result = await getAdminOrders({ page, pageSize, search, status });

    if (!result.success) {
      return NextResponse.json(result, {
        status: getErrorStatus(result.error, result.validationErrors),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders." },
      { status: 500 },
    );
  }
}

/**
 * Updates order status from admin actions.
 */
export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as { orderId?: string; status?: number };

    if (!body.orderId || typeof body.status !== "number") {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 },
      );
    }

    const result = await updateAdminOrderStatus(body.orderId, body.status);

    if (!result.success) {
      return NextResponse.json(result, {
        status: getErrorStatus(result.error, result.validationErrors),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update order status." },
      { status: 500 },
    );
  }
}
