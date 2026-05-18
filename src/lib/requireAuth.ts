import { Pages, Routes } from "@/constants/enums";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type AppRole = "USER" | "ADMIN";

/**
 * Ensures the current request has an authenticated session.
 * Redirects to localized sign-in page when the user is not logged in.
 */
export const requireAuth = async (locale: string, requiredRole?: AppRole) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/${Routes.AUTH}/${Pages.LOGIN}`);
  }

  if (requiredRole && session.user.role !== requiredRole) {
    redirect(`/${locale}/${Routes.PROFILE}`);
  }

  return session;
};
