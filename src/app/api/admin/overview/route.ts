import { getAdminOverview } from "@/server/Actions/Admin";
import { NextResponse } from "next/server";

/**
 * Returns aggregate owner KPIs for the admin dashboard.
 */
export async function GET() {
  try {
    const overview = await getAdminOverview();
    return NextResponse.json(overview);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to load admin overview." },
      { status: 500 },
    );
  }
}
