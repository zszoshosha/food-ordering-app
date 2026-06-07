import EditUserForm from "@/components/profile/edit-user-form";
import OrderHistoryPanel from "@/components/profile/OrderHistoryPanel";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { requireAuth } from "@/lib/requireAuth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Mail, ShieldCheck, Globe2, UserCircle2 } from "lucide-react";

/**
 * Profile page placeholder for the localized account area.
 */
const ProfilePage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const session = await requireAuth(locale);
  const t = await getTranslations("profile");

  if (session.user.role === AUTH_ROLES.ADMIN) {
    redirect(`/${locale}/admin`);
  }

  return (
    <main className="min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Account
          </p>
          <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <EditUserForm
            title={t("title")}
            description={`Welcome ${session.user?.name ?? session.user?.email ?? "user"}`}
            helperText={t("helperText")}
            actionLabel={
              locale === "ar"
                ? "حفظ التغييرات (قريبًا)"
                : "Save changes (coming soon)"
            }
            labels={{
              name: t("form.name.label"),
              email: t("form.email.label"),
              role: "Role",
            }}
            user={{
              name: session.user?.name,
              email: session.user?.email,
              role: session.user.role,
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <UserCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Signed in as
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.user?.name ?? session.user?.email ?? "User"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/20 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user?.email ?? "No email available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Role</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                  <Globe2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Locale
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {locale.toUpperCase()} {locale === "ar" ? "RTL" : "LTR"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <OrderHistoryPanel locale={locale} />
      </div>
    </main>
  );
};

export default ProfilePage;
