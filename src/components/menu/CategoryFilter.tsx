"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const CATEGORY_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Pizza", value: "pizza" },
  { label: "Burger", value: "burger" },
  { label: "Grills", value: "grills" },
] as const;

type CategoryFilterProps = {
  ariaLabel?: string;
};

const CategoryFilter = ({
  ariaLabel = "Filter products by category",
}: CategoryFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") ?? "ALL";

  const updateCategory = (nextCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCategory === "ALL") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }

    params.delete("page");

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex w-full flex-wrap items-center gap-3 overflow-x-auto pb-1"
    >
      {CATEGORY_OPTIONS.map((category) => {
        const isActive =
          activeCategory === category.value ||
          (!searchParams.get("category") && category.value === "ALL");

        return (
          <button
            key={category.value}
            type="button"
            onClick={() => updateCategory(category.value)}
            aria-pressed={isActive}
            className={`inline-flex min-w-24 items-center justify-center rounded-full border px-5 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/20 ${
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-white/80 text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
