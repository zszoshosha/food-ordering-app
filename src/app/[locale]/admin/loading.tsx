const AdminLoading = () => {
  return (
    <main className="min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl space-y-4">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-80 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="h-72 animate-pulse rounded-3xl border bg-card" />
          <div className="h-72 animate-pulse rounded-3xl border bg-card" />
        </div>

        <section className="mt-8 rounded-3xl border bg-card p-6 shadow-sm md:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl border bg-background"
              />
            ))}
          </div>

          <div className="mt-6 h-12 animate-pulse rounded-xl bg-muted" />
          <div className="mt-6 h-80 animate-pulse rounded-xl border bg-background" />
        </section>
      </div>
    </main>
  );
};

export default AdminLoading;
