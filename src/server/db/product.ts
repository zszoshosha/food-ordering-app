import { Cache } from "@/lib/cache";
import { db, withPrismaRetry } from "@/lib/prisma";
import { ProductWithRelations } from "@/types/Product";

export const MENU_CACHE_TAG = "menu-cache";
export const CATEGORY_CACHE_TAG = "categories-cache";

/**
 * Fetches all products with their sizes and extras from the database.
 * Results are cached for 1 hour (3600 seconds) and tagged for menu revalidation.
 *
 * @returns {Promise<ProductWithRelations[]>} All products with related sizes and extras.
 */
export const getProductsByDb = Cache(
  async () => {
    try {
      return await withPrismaRetry(() =>
        db.product.findMany({
          include: { sizes: true, extras: true },
        }),
      );
    } catch (error) {
      // Keep storefront rendering during temporary database outages.
      console.error("Failed to load products from database:", error);
      return [] as ProductWithRelations[];
    }
  },
  ["menu-products"],
  {
    revalidate: 3600,
    tags: [MENU_CACHE_TAG],
  },
);

/**
 * Fetches available menu categories from existing products.
 */
export const getMenuCategoriesByDb = Cache(
  async () => {
    try {
      const categories = await withPrismaRetry(() =>
        db.product.findMany({
          select: {
            category: true,
          },
          distinct: ["category"],
          orderBy: {
            category: "asc",
          },
        }),
      );

      return categories.map((item) => item.category);
    } catch (error) {
      console.error("Failed to load categories from database:", error);
      return [] as string[];
    }
  },
  ["menu-categories"],
  {
    revalidate: 3600,
    tags: [CATEGORY_CACHE_TAG],
  },
);
