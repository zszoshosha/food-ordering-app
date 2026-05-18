"use client";

import Link from "@/components/link";
import { Pages, Routes } from "@/constants/enums";
import { buttonVariants } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

/**
 * Dedicated auth actions for navbar.
 * Shows sign-in for guests and profile/sign-out for authenticated users.
 */
const AuthButtons = ({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) => {
  const { data: session, status } = useSession();
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("common");

  if (status === "loading") {
    return (
      <div className={className}>
        <span className="text-sm text-muted-foreground">...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={className}>
        <Link
          href={`${Routes.AUTH}/${Pages.LOGIN}`}
          onClick={onNavigate}
          className={`${buttonVariants({ size: "lg" })} px-8! rounded-full hover:scale-105 transition-transform duration-200 bg-linear-to-r from-primary to-primary/80`}
        >
          {t("signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      {session.user.role === "ADMIN" && (
        <Link
          href={Routes.ADMIN}
          onClick={onNavigate}
          className={`${buttonVariants({ size: "lg", variant: "outline" })} rounded-full`}
        >
          {t("admin")}
        </Link>
      )}
      <Link
        href={Routes.PROFILE}
        onClick={onNavigate}
        className={`${buttonVariants({ size: "lg", variant: "outline" })} rounded-full`}
      >
        {t("profile")}
      </Link>
      <button
        type="button"
        onClick={() =>
          signOut({
            callbackUrl: `/${locale}/${Routes.AUTH}/${Pages.LOGIN}`,
          })
        }
        className={`${buttonVariants({ size: "lg" })} rounded-full`}
      >
        {t("signOut")}
      </button>
    </div>
  );
};

export default AuthButtons;
