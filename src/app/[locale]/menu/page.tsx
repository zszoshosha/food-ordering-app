import Link from "next/link";
import { ProductCategory } from "@prisma/client";
import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { db, withPrismaRetry } from "@/lib/prisma";
import { ProductWithRelations } from "@/types/Product";

type MenuPageParams = {
  locale: string;
};

type MenuPageSearchParams = {
  search?: string;
  category?: string;
  page?: string;
};

type MenuPageProps = {
  params: Promise<MenuPageParams>;
  searchParams: Promise<MenuPageSearchParams>;
};

const ITEMS_PER_PAGE = 6;

const DEFAULT_CATEGORY_IDS = [
  "CLASSIC",
  "SPECIALTY",
  "VEGETARIAN",
  "MEAT",
  "SEAFOOD",
] as const;

const CATEGORY_ICONS: Record<string, string> = {
  ALL: "🍕",
  CLASSIC: "🍕",
  SPECIALTY: "⭐",
  VEGETARIAN: "🥗",
  MEAT: "🥓",
  SEAFOOD: "🦐",
};

const CATEGORY_LABELS: Record<string, string> = {
  ALL: "All Pizzas",
  CLASSIC: "Classic",
  SPECIALTY: "Specialty",
  VEGETARIAN: "Vegetarian",
  MEAT: "Meat",
  SEAFOOD: "Seafood",
};

const isMenuCategory = (value: string): value is ProductCategory =>
  DEFAULT_CATEGORY_IDS.includes(value as ProductCategory);

const buildMenuHref = (
  locale: string,
  options: {
    search: string;
    category: string;
    page: number;
  },
) => {
  const params = new URLSearchParams();

  if (options.search) {
    params.set("search", options.search);
  }

  if (options.category !== "ALL") {
    params.set("category", options.category);
  }

  if (options.page > 1) {
    params.set("page", String(options.page));
  }

  const query = params.toString();
  return query ? `/${locale}/menu?${query}` : `/${locale}/menu`;
};

export default async function MenuPage({
  params,
  searchParams,
}: MenuPageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const search = resolvedSearchParams.search?.trim() ?? "";
  const requestedCategory =
    resolvedSearchParams.category?.trim().toUpperCase() ?? "ALL";
  const category =
    requestedCategory === "ALL" || isMenuCategory(requestedCategory)
      ? requestedCategory
      : "ALL";

  const requestedPage = Number.parseInt(resolvedSearchParams.page ?? "1", 10);
  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const where = {
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(category !== "ALL"
      ? {
          category: category as ProductCategory,
        }
      : {}),
  };

  const totalItems = await withPrismaRetry(() => db.product.count({ where }));
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const products: ProductWithRelations[] = await withPrismaRetry(() =>
    db.product.findMany({
      where,
      include: {
        sizes: true,
        extras: true,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (safePage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
  );

  const categoryOptions = ["ALL", ...DEFAULT_CATEGORY_IDS];

  return (
    <main className="py-10 md:py-14 page-surface">
      <div className="container mx-auto px-4">
        <MainHeading title="Our Menu" subTitle="Explore" />

        <div className="mt-8 mb-6 grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4 max-w-4xl mx-auto">
          <form action={`/${locale}/menu`} method="get" className="contents">
            <input type="hidden" name="category" value={category} />
            <input type="hidden" name="page" value="1" />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search by pizza name or ingredient..."
              className="w-full h-11 rounded-xl border border-border bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
              aria-label="Search pizzas"
            />
          </form>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-1">
            <div className="h-11 rounded-xl border border-border bg-white/70 px-3 text-sm text-muted-foreground flex items-center">
              Page {safePage} of {totalPages}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categoryOptions.map((categoryId) => {
            const href = buildMenuHref(locale, {
              search,
              category: categoryId,
              page: 1,
            });
            const isActive = category === categoryId;

            return (
              <Link
                key={categoryId}
                href={href}
                className={`inline-flex min-w-30 items-center justify-center rounded-full border px-5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white/70 text-foreground hover:border-primary hover:text-primary"
                }`}
              >
                <span className="mr-2">{CATEGORY_ICONS[categoryId]}</span>
                {CATEGORY_LABELS[categoryId] ?? categoryId}
              </Link>
            );
          })}
        </div>

        <div className="mb-6 text-center text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-primary">{products.length}</span>{" "}
          of <span className="font-semibold text-primary">{totalItems}</span>{" "}
          items
          {search ? (
            <>
              {" "}
              for{" "}
              <span className="font-semibold text-foreground">"{search}"</span>
            </>
          ) : null}
          {category !== "ALL" ? (
            <>
              {" "}
              in{" "}
              <span className="font-semibold text-foreground">{category}</span>
            </>
          ) : null}
        </div>

        {products.length > 0 ? (
          <Menu items={products} />
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              Try another search term or clear the category filter.
            </p>
            <Link
              href={`/${locale}/menu`}
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Reset Filters
            </Link>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages}
          </div>
          <div className="flex items-center gap-3">
            {safePage > 1 ? (
              <Link
                href={buildMenuHref(locale, {
                  search,
                  category,
                  page: safePage - 1,
                })}
                className="inline-flex items-center justify-center rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center rounded-full border border-border bg-white/40 px-4 py-2 text-sm font-medium text-muted-foreground">
                Previous
              </span>
            )}

            {safePage < totalPages ? (
              <Link
                href={buildMenuHref(locale, {
                  search,
                  category,
                  page: safePage + 1,
                })}
                className="inline-flex items-center justify-center rounded-full border border-border bg-white/70 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center rounded-full border border-border bg-white/40 px-4 py-2 text-sm font-medium text-muted-foreground">
                Next
              </span>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
