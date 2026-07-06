"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type PaginationProps = {
  totalPages: number;
  currentPage: number;
};

const Pagination = ({ totalPages, currentPage }: PaginationProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    Math.max(totalPages, 1),
  );

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(nextPage));
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-white/80 px-4 py-3"
    >
      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage - 1)}
        disabled={safeCurrentPage <= 1}
        className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:border-border/50 disabled:text-muted-foreground"
        aria-label="Go to previous page"
      >
        Previous
      </button>

      <div className="text-sm text-muted-foreground">
        Page{" "}
        <span className="font-semibold text-foreground">{safeCurrentPage}</span>{" "}
        of {totalPages}
      </div>

      <button
        type="button"
        onClick={() => goToPage(safeCurrentPage + 1)}
        disabled={safeCurrentPage >= totalPages}
        className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:border-border/50 disabled:text-muted-foreground"
        aria-label="Go to next page"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
