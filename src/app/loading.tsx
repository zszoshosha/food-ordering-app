import { Suspense } from "react";

function MenuCardSkeleton({ index }: { index: number }) {
  return (
    <article
      className="animate-pulse overflow-hidden rounded-2xl border border-border/70 bg-white/70 shadow-sm"
      aria-hidden="true"
    >
      <div className="aspect-4/3 w-full bg-linear-to-br from-muted to-muted/40" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 rounded-md bg-muted" />
        <div className="h-4 w-1/2 rounded-md bg-muted/80" />
        <div className="h-4 w-full rounded-md bg-muted/70" />
        <div className="h-4 w-5/6 rounded-md bg-muted/60" />
      </div>
    </article>
  );
}

function MenuGridSkeleton() {
  return (
    <section
      className="container mx-auto px-4 py-10 md:py-14"
      aria-label="Loading menu"
      role="status"
      aria-live="polite"
    >
      <div className="mb-8 space-y-3 text-center">
        <div className="mx-auto h-8 w-56 rounded-lg bg-muted animate-pulse" />
        <div className="mx-auto h-4 w-80 max-w-full rounded-md bg-muted/80 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <MenuCardSkeleton key={index} index={index} />
        ))}
      </div>
    </section>
  );
}

/**
 * Global route-level loading fallback for App Router streaming.
 * Suspense keeps this compatible with nested async boundaries.
 */
export default function Loading(): JSX.Element {
  return (
    <Suspense fallback={<MenuGridSkeleton />}>
      <MenuGridSkeleton />
    </Suspense>
  );
}
