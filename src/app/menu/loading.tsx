const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
    <div className="aspect-4/3 w-full animate-pulse bg-muted" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
      <div className="h-3 w-full animate-pulse rounded bg-muted" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
      <div className="h-9 w-1/2 animate-pulse rounded-full bg-muted" />
    </div>
  </div>
);

const MenuLoading = () => {
  return (
    <main className="min-h-screen py-10 md:py-14 page-surface">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="mx-auto h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-10 w-72 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-[1fr_240px]">
          <div className="h-11 animate-pulse rounded-xl bg-muted" />
          <div className="h-11 animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-28 animate-pulse rounded-full bg-muted"
            />
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default MenuLoading;
