import { getAdminUsers } from "@/server/Actions/Admin";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns paginated users for admin management.
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
    const role = request.nextUrl.searchParams.get("role") ?? "ALL";

    const result = await getAdminUsers({ page, pageSize, search, role });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch users." },
      { status: 500 },
    );
  }
}
