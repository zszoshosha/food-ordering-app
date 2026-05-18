import { createOrder } from "@/server/Actions/Order";
import { authOptions } from "@/server/auth";
import { getUserOrdersByDb } from "@/server/db/order";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await getUserOrdersByDb(session.user.id);
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const result = await createOrder(session.user.id, payload);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          details: "details" in result ? result.details : undefined,
        },
        { status: result.status },
      );
    }

    return NextResponse.json(result.order, { status: result.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
