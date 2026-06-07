import { Routes } from "@/constants/enums";
import { AuthRole } from "@/lib/auth/roles";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

/**
 * Ensures the current request has an authenticated session.
 * Redirects to localized sign-in page when the user is not logged in.
 */
export const requireAuth = async (locale: string, requiredRole?: AuthRole) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (requiredRole && session.user.role !== requiredRole) {
    redirect(`/${locale}/${Routes.UNAUTHORIZED}`);
  }

  return session;
};
