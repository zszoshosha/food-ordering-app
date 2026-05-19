import { NextResponse } from "next/server";
import { getMenuCategoriesByDb } from "@/server/db/product";

export async function GET() {
  try {
    const categories = await getMenuCategoriesByDb();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
}
