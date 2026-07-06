import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-surface min-h-[70vh] py-12 md:py-16">
      <section className="container mx-auto px-4">
        <article className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-background/90 shadow-sm backdrop-blur">
          <div className="border-b border-border/60 px-8 py-6 md:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
              404 Not Found
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              We could not find that page
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
              The link may be outdated, removed, or typed incorrectly. Return to
              the homepage to continue browsing.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 px-8 py-6 md:px-10">
            <div className="hidden h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl md:flex">
              🍽️
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Go to Homepage
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
