import { markOrderPaid } from "@/server/Actions/Payment";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const getErrorStatus = (
  error: string,
  validationErrors?: Record<string, string[]>,
) => {
  if (error === "Unauthorized") return 401;
  if (validationErrors) return 400;
  if (/not found/i.test(error)) return 404;
  if (/illegal order status transition/i.test(error)) return 409;
  if (/failed/i.test(error)) return 500;
  return 400;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "Mock payment confirmation is disabled." },
      { status: 403 },
    );
  }

  try {
    const payload = (await req.json()) as {
      orderId?: string;
      paymentIntentId?: string;
    };

    const result = await markOrderPaid(
      payload.orderId ?? "",
      payload.paymentIntentId ?? "",
    );

    if (!result.success) {
      return NextResponse.json(result, {
        status: getErrorStatus(result.error, result.validationErrors),
      });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to confirm mock payment." },
      { status: 500 },
    );
  }
}
