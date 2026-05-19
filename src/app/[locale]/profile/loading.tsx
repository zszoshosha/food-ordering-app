const ProfileLoading = () => {
  return (
    <main className="min-h-screen py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-72 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full max-w-xl animate-pulse rounded bg-muted" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-72 animate-pulse rounded-3xl border bg-card" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-3xl border bg-card"
              />
            ))}
          </div>
        </div>

        <div className="mt-8 h-80 animate-pulse rounded-3xl border bg-card" />
      </div>
    </main>
  );
};

export default ProfileLoading;
