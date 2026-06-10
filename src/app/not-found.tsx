import Link from "next/link";

/**
 * Global not-found UI for missing pages and menu items.
 */
export default function NotFound() {
  return (
    <main className="page-surface min-h-[70vh] py-12 md:py-16">
      <section className="container mx-auto px-4">
        <article className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/60 bg-white/85 shadow-sm backdrop-blur">
          <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">
                404 Not Found
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                We could not find this menu item
              </h1>
              <p className="mt-4 text-muted-foreground">
                The product may have been removed, renamed, or the link is
                outdated. You can browse the latest menu and discover available
                dishes.
              </p>

              <nav
                aria-label="Not found actions"
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Browse Menu
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Back Home
                </Link>
              </nav>
            </div>

            <aside className="relative overflow-hidden bg-linear-to-br from-orange-100 via-amber-50 to-rose-100 p-8 md:p-10">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-emerald-300/20 blur-2xl" />
              <div className="relative">
                <p className="text-7xl leading-none">🍕</p>
                <h2 className="mt-4 text-xl font-semibold text-foreground">
                  Fresh Picks Await
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Jump back into the catalog and find your next favorite meal.
                </p>
              </div>
            </aside>
          </div>
        </article>
      </section>
    </main>
  );
}
