"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Global App Router error boundary.
 * Keeps shell visible and allows retrying failed segment rendering.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps): JSX.Element {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <main className="page-surface min-h-[70vh] py-12 md:py-16">
      <section className="container mx-auto px-4">
        <article className="mx-auto max-w-2xl rounded-2xl border border-destructive/20 bg-white/85 p-8 text-center shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-destructive/80">
            Something went wrong
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            We hit an unexpected issue
          </h1>
          <p className="mt-4 text-muted-foreground">
            The page failed to load correctly. Try again now, or return to the menu.
          </p>

          {error.digest ? (
            <p className="mt-4 text-xs text-muted-foreground/80">Error ID: {error.digest}</p>
          ) : null}

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-w-36 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Try Again
            </button>
            <Link
              href="/menu"
              className="inline-flex min-w-36 items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Go To Menu
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
