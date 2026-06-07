import { AUTH_ROLES } from "@/lib/auth/roles";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import { getAdminOverview } from "../../../../server/Actions/Admin";
import { NextResponse } from "next/server";

/**
 * Returns aggregate owner KPIs for the admin dashboard.
 */
export async function GET() {
  // Secondary gate at the route level in addition to middleware/action checks.
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (session.user.role !== AUTH_ROLES.ADMIN) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

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
