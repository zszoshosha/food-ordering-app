"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type AdminErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const AdminErrorBoundary = ({ error, reset }: AdminErrorBoundaryProps) => {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? "en";
  const isArabic = locale === "ar";

  useEffect(() => {
    console.error("Admin route error boundary caught an error", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] py-16">
      <div className="container mx-auto max-w-2xl px-4">
        <section className="rounded-3xl border bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            {isArabic ? "خطأ في لوحة الإدارة" : "Admin workspace error"}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
            {isArabic ? "حدث خطأ غير متوقع" : "Something unexpected happened"}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {isArabic
              ? "يمكنك المحاولة مرة أخرى أو الرجوع إلى القائمة الرئيسية."
              : "You can try loading this section again or return to the main menu."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              {isArabic ? "حاول مرة أخرى" : "Try again"}
            </button>
            <Link
              href={`/${locale}/menu`}
              className="rounded-full border px-5 py-2.5 text-sm font-medium"
            >
              {isArabic ? "الذهاب إلى القائمة" : "Go to menu"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminErrorBoundary;
