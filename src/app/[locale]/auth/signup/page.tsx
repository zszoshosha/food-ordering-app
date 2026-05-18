import Link from "@/components/link";
import { Pages, Routes } from "@/constants/enums";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import getTrans from "@/lib/translation";
import Form from "./_components/Form";

/**
 * Sign-Up page — server component.
 * Loads the current locale and translations server-side,
 * then passes them to the client-side Form component.
 */
export default async function SignUpPage() {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-primary">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join us and start ordering your favorite meals
          </p>
        </div>

        <Form translation={translations} />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/${Routes.AUTH}/${Pages.LOGIN}`}
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
