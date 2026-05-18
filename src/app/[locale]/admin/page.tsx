import EditUserForm from "@/components/profile/edit-user-form";
import { requireAuth } from "@/lib/requireAuth";
import { getTranslations } from "next-intl/server";
import {
  ClipboardList,
  LayoutGrid,
  Settings2,
  ShoppingBag,
  Users,
} from "lucide-react";

/**
 * Localized admin page protected by the shared auth-role helper.
 */
const AdminPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const session = await requireAuth(locale, "ADMIN");
  const t = await getTranslations("admin");

  const adminSections = [
    {
      title: t("tabs.profile"),
      description:
        "Review the signed-in account and keep access details in sync.",
      icon: LayoutGrid,
      tone: "bg-primary/10 text-primary",
    },
    {
      title: t("tabs.categories"),
      description:
        "Organize the menu structure and keep groups easy to browse.",
      icon: ClipboardList,
      tone: "bg-secondary/20 text-primary",
    },
    {
      title: t("tabs.menuItems"),
      description: "Build, edit, and publish dishes from one place.",
      icon: ShoppingBag,
      tone: "bg-accent/15 text-primary",
    },
    {
      title: t("tabs.users"),
      description: "Track customer accounts and management access.",
      icon: Users,
      tone: "bg-muted text-foreground",
    },
    {
      title: t("tabs.orders"),
      description: "Follow active orders and prepare for fulfillment.",
      icon: Settings2,
      tone: "bg-primary/10 text-primary",
    },
  ];

  return (
    <main className="min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Management
          </p>
          <h1 className="mt-3 text-4xl font-bold text-foreground md:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <EditUserForm
            title={t("title")}
            description={`Welcome admin ${session.user?.name ?? session.user?.email ?? "user"}`}
            helperText={t("helperText")}
            actionLabel={
              locale === "ar"
                ? "إدارة عبر الشاشات المخصصة"
                : "Manage through the dedicated screens"
            }
            labels={{
              name: "Name",
              email: "Email",
              role: "Role",
            }}
            user={{
              name: session.user?.name,
              email: session.user?.email,
              role: session.user.role,
            }}
          />

          <section className="rounded-3xl border bg-card p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Quick areas
                </p>
                <h2 className="mt-2 text-2xl font-bold text-foreground">
                  Core management sections
                </h2>
              </div>
              <span className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {session.user.role}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {adminSections.map((section) => {
                const Icon = section.icon;

                return (
                  <div
                    key={section.title}
                    className="rounded-2xl border bg-background p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${section.tone}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-foreground">
                          {section.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default AdminPage;
