import { getAdminUsers } from "../../../../server/Actions/Admin";
import { NextRequest, NextResponse } from "next/server";

const getErrorStatus = (
  error: string,
  validationErrors?: Record<string, string[]>,
) => {
  if (error === "Unauthorized") return 401;
  if (validationErrors) return 400;
  if (/failed/i.test(error)) return 500;
  return 400;
};

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

    if (!result.success) {
      return NextResponse.json(result, {
        status: getErrorStatus(result.error, result.validationErrors),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch users." },
      { status: 500 },
    );
  }
}
