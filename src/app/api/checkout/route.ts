import { auth } from "@/auth";
import { db, withPrismaRetry } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";
import { checkoutItemSchema } from "@/validation/checkout";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const checkoutPayloadSchema = z.object({
  orderId: z.string().cuid(),
  cartItems: z.array(checkoutItemSchema).min(1),
});

type CheckoutItem = z.infer<typeof checkoutItemSchema>;

const toAbsoluteImageUrl = (imagePath?: string) => {
  if (!imagePath) {
    return undefined;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return undefined;
  }

  return `${appUrl.replace(/\/$/, "")}/${imagePath.replace(/^\//, "")}`;
};

const calculateUnitAmountInMinorCurrency = (
  item: CheckoutItem,
  product: {
    basePrice: number;
    sizes: Array<{ id: string; price: number }>;
    extras: Array<{ id: string; price: number }>;
  },
) => {
  const sizePrice = item.sizeId
    ? (product.sizes.find((size) => size.id === item.sizeId)?.price ?? null)
    : 0;

  if (item.sizeId && sizePrice === null) {
    throw new Error("Invalid size selection for one of the items.");
  }

  const extrasPrice = (item.extraIds ?? []).reduce((sum, extraId) => {
    const extra = product.extras.find((entry) => entry.id === extraId);
    if (!extra) {
      throw new Error("Invalid extras selection for one of the items.");
    }

    return sum + Number(extra.price);
  }, 0);

  // Stripe expects amounts in the minor currency unit (e.g. cents/piasters).
  const unitAmount =
    Number(product.basePrice) + Number(sizePrice) + extrasPrice;
  return Math.round(unitAmount * 100);
};

export async function POST(request: Request) {
  const session = await auth();

  try {
    const payload = checkoutPayloadSchema.safeParse(await request.json());

    if (!payload.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid checkout payload.",
          validationErrors: payload.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return NextResponse.json(
        { success: false, error: "NEXT_PUBLIC_APP_URL is not configured." },
        { status: 500 },
      );
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: "STRIPE_SECRET_KEY is not configured." },
        { status: 500 },
      );
    }

    const order = await withPrismaRetry(() =>
      db.order.findUnique({
        where: { id: payload.data.orderId },
        select: {
          id: true,
          userId: true,
        },
      }),
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found." },
        { status: 404 },
      );
    }

    if (session?.user?.id && order.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden: order does not belong to user." },
        { status: 403 },
      );
    }

    const productIds = [
      ...new Set(payload.data.cartItems.map((item) => item.productId)),
    ];

    const products = await withPrismaRetry(() =>
      db.product.findMany({
        where: { id: { in: productIds } },
        include: { sizes: true, extras: true },
      }),
    );

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: "One or more cart items are no longer available.",
        },
        { status: 400 },
      );
    }

    const lineItems = payload.data.cartItems.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);

      if (!product) {
        throw new Error("One or more cart items are no longer available.");
      }

      const unitAmount = calculateUnitAmountInMinorCurrency(item, product);
      if (unitAmount <= 0) {
        throw new Error("Invalid product price.");
      }

      const imageUrl = toAbsoluteImageUrl(product.image);

      return {
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount,
          product_data: {
            name: product.name,
            ...(imageUrl ? { images: [imageUrl] } : {}),
          },
        },
      };
    });

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${appUrl.replace(/\/$/, "")}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl.replace(/\/$/, "")}/cart`,
      metadata: {
        orderId: payload.data.orderId,
        userId: order.userId,
      },
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { success: false, error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create checkout session." },
      { status: 500 },
    );
  }
}
