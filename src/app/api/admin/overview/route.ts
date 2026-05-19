import { getAdminOverview } from "../../../../server/Actions/Admin";
import { NextResponse } from "next/server";

/**
 * Returns aggregate owner KPIs for the admin dashboard.
 */
export async function GET() {
  const result = await getAdminOverview();

  if (!result.success) {
    const status =
      result.error === "Unauthorized"
        ? 401
        : /failed/i.test(result.error)
          ? 500
          : 400;

    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
