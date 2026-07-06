import { Routes } from "@/constants/enums";
import { AuthRole } from "@/lib/auth/roles";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Ensures the current request has an authenticated session.
 * Redirects to localized sign-in page when the user is not logged in.
 */
export const requireAuth = async (locale: string, requiredRole?: AuthRole) => {
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (requiredRole && session.user.role !== requiredRole) {
    redirect(`/${locale}/${Routes.UNAUTHORIZED}`);
  }

  return session;
};
