import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "@/server/Actions/Admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns all products for admin management.
 */
export async function GET() {
  try {
    const products = await getAdminProducts();
    return NextResponse.json({ items: products });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch products." },
      { status: 500 },
    );
  }
}

/**
 * Creates a product from admin payload.
 */
export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as { locale?: string } & Record<
      string,
      unknown
    >;
    const result = await createAdminProduct(
      payload as Parameters<typeof createAdminProduct>[0],
      payload.locale ?? "en",
    );

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error ?? "Invalid product payload.",
          fieldErrors: "fieldErrors" in result ? result.fieldErrors : undefined,
        },
        { status: result.status },
      );
    }

    return NextResponse.json(result.item, { status: result.status });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create product." },
      { status: 500 },
    );
  }
}

/**
 * Updates a product by id query parameter.
 */
export async function PUT(req: Request) {
  try {
    const request = req as NextRequest;
    const productId = request.nextUrl.searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "Missing product id." },
        { status: 400 },
      );
    }

    const payload = await req.json();
    const result = await updateAdminProduct(productId, payload);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: "error" in result ? result.error : "Invalid product payload.",
          fieldErrors:
            "fieldErrors" in result
              ? result.fieldErrors
              : "errors" in result
                ? result.errors
                : undefined,
        },
        { status: result.status },
      );
    }

    return NextResponse.json(result.item, { status: result.status });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update product." },
      { status: 500 },
    );
  }
}

/**
 * Deletes a product by id query parameter.
 */
export async function DELETE(req: Request) {
  try {
    const request = req as NextRequest;
    const productId = request.nextUrl.searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "Missing product id." },
        { status: 400 },
      );
    }

    const result = await deleteAdminProduct(productId);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to delete product." },
      { status: 500 },
    );
  }
}
