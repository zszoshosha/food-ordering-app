import { createPaymentIntentForOrder } from "@/server/Actions/Payment";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const getErrorStatus = (
  error: string,
  validationErrors?: Record<string, string[]>,
) => {
  if (error === "Unauthorized") return 401;
  if (validationErrors) return 400;
  if (/rate limit/i.test(error)) return 429;
  if (/could not connect to stripe/i.test(error)) return 503;
  if (/authentication failed/i.test(error)) return 502;
  if (/not found/i.test(error)) return 404;
  if (/failed|not configured/i.test(error)) return 500;
  if (/pending/i.test(error)) return 409;
  return 400;
};

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const payload = (await req.json()) as { orderId?: string };
    const result = await createPaymentIntentForOrder(payload.orderId ?? "");

    if (!result.success) {
      return NextResponse.json(result, {
        status: getErrorStatus(result.error, result.validationErrors),
      });
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create payment intent." },
      { status: 500 },
    );
  }
}
