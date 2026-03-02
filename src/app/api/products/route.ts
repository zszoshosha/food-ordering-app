/**
 * Products API Route
 *
 * GET /api/products
 *
 * This API endpoint was introduced to replace direct database calls from client components.
 * Previously, the menu page imported GetproductsByDb directly, which caused issues because
 * Prisma (server-only) code was being bundled into the client bundle.
 *
 * Now the menu page fetches from this API route instead, keeping the DB logic server-side.
 */
import { NextResponse } from "next/server";
import { GetproductsByDb } from "@/server/db/product";

export async function GET() {
  try {
    // Fetch all products with their relations (sizes, extras) from the database
    const products = await GetproductsByDb();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
