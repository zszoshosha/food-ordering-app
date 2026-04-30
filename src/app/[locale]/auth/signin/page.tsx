import Link from "@/components/link";
import { Pages, Routes } from "@/constants/enums";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import Form from "./_components/Form";

export default async function SignInPage() {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-primary">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue your order
          </p>
        </div>

        <Form translations={translations} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={`/${Routes.AUTH}/${Pages.Register}`}
            className="font-semibold text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
