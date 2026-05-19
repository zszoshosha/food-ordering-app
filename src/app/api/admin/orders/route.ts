import { getAdminOrders, updateAdminOrderStatus } from "@/server/Actions/Admin";
import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch orders." },
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
        { error: "Invalid request body." },
        { status: 400 },
      );
    }

    const result = await updateAdminOrderStatus(body.orderId, body.status);

    if (!result.ok) {
      return NextResponse.json(
        { error: "Invalid order status payload.", details: result.errors },
        { status: result.status },
      );
    }

    return NextResponse.json(result.item, { status: result.status });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update order status." },
      { status: 500 },
    );
  }
}
