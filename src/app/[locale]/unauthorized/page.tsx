import Link from "next/link";

type UnauthorizedPageProps = {
  params: Promise<{ locale: string }>;
};

const UnauthorizedPage = async ({ params }: UnauthorizedPageProps) => {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return (
    <main className="min-h-[70vh] py-16">
      <div className="container mx-auto max-w-2xl px-4">
        <section className="rounded-3xl border bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {isArabic ? "الوصول مرفوض" : "Access denied"}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
            {isArabic
              ? "ليست لديك صلاحية لهذه الصفحة"
              : "You are not allowed to view this page"}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {isArabic
              ? "يرجى تسجيل الدخول بحساب يملك الصلاحية المناسبة ثم المحاولة مرة أخرى."
              : "Please sign in with an account that has the required role, then try again."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${locale}/auth/signin`}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              {isArabic ? "تسجيل الدخول" : "Sign in"}
            </Link>
            <Link
              href={`/${locale}/menu`}
              className="rounded-full border px-5 py-2.5 text-sm font-medium"
            >
              {isArabic ? "العودة للقائمة" : "Back to menu"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default UnauthorizedPage;
