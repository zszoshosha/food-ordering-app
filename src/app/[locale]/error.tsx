"use client";

import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Locale route error boundary caught:", error);
  }, [error]);

  return (
    <main className="page-surface min-h-[70vh] py-12 md:py-16">
      <section className="container mx-auto px-4">
        <article className="mx-auto max-w-2xl rounded-3xl border border-destructive/15 bg-background/90 p-8 shadow-sm backdrop-blur md:p-10">
          <div className="inline-flex rounded-full border border-destructive/15 bg-destructive/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-destructive/80">
            Unexpected error
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Something went wrong
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            The page could not finish rendering. You can try again now or go
            back to the homepage.
          </p>

          {error.digest ? (
            <p className="mt-4 text-xs font-medium text-muted-foreground/80">
              Error ID: {error.digest}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Back Home
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
