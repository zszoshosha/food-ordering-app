import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "../../../../server/Actions/Admin";
import { NextRequest, NextResponse } from "next/server";

const getErrorStatus = (
  error: string,
  validationErrors?: Record<string, string[]>,
) => {
  if (error === "Unauthorized") return 401;
  if (validationErrors) return 400;
  if (/not found/i.test(error)) return 404;
  if (/already exists|cannot be deleted|linked/i.test(error)) return 409;
  if (/failed/i.test(error)) return 500;
  return 400;
};

/**
 * Returns all products for admin management.
 */
export async function GET() {
  const result = await getAdminProducts();
  if (!result.success) {
    return NextResponse.json(result, {
      status: getErrorStatus(result.error, result.validationErrors),
    });
  }

  return NextResponse.json(result);
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

    if (!result.success) {
      return NextResponse.json(result, {
        status: getErrorStatus(result.error, result.validationErrors),
      });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create product." },
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

    if (!result.success) {
      return NextResponse.json(result, {
        status: getErrorStatus(result.error, result.validationErrors),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update product." },
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

    if (!result.success) {
      return NextResponse.json(result, {
        status: getErrorStatus(result.error, result.validationErrors),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product." },
      { status: 500 },
    );
  }
}
