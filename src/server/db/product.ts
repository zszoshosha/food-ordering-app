import { Cache } from "@/lib/cache";
import { db, withPrismaRetry } from "@/lib/prisma";
import { ProductWithRelations } from "@/types/Product";
import { unstable_cache } from "next/cache";
import { cache } from "react";

export const MENU_CACHE_TAG = "menu-data";
export const CATEGORY_CACHE_TAG = "categories-cache";
export const PRODUCT_CACHE_TAG = "product-cache";

/**
 * Example of combining React request deduping and Next persistent caching.
 * Use this in server components to heavily cache the menu catalog for 1 hour.
 */
export const getMenuCatalogCached = unstable_cache(
  cache(async (): Promise<ProductWithRelations[]> => {
    try {
      return await withPrismaRetry(() =>
        db.product.findMany({
          include: { sizes: true, extras: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        }),
      );
    } catch (error) {
      console.error("Failed to load menu catalog from database:", error);
      return [] as ProductWithRelations[];
    }
  }),
  ["menu-catalog"],
  {
    revalidate: 3600,
    tags: [MENU_CACHE_TAG],
  },
);

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

/**
 * Fetches a single product by id with sizes and extras.
 * Uses cache tags so admin updates can invalidate product details pages.
 */
export const getProductByIdByDb = Cache(
  async (id: string) => {
    try {
      return await withPrismaRetry(() =>
        db.product.findUnique({
          where: { id },
          include: { sizes: true, extras: true },
        }),
      );
    } catch (error) {
      console.error(`Failed to load product ${id}:`, error);
      return null;
    }
  },
  ["menu-product-by-id"],
  {
    revalidate: 3600,
    tags: [MENU_CACHE_TAG, PRODUCT_CACHE_TAG],
  },
);

/**
 * Fetches a single product by product slug.
 */
export const getProductBySlugByDb = Cache(
  async (slug: string) => {
    try {
      return await withPrismaRetry(() =>
        db.product.findFirst({
          where: { slug } as never,
          include: { sizes: true, extras: true },
        } as never),
      );
    } catch (error) {
      console.error(`Failed to load product slug ${slug}:`, error);
      return null;
    }
  },
  ["menu-product-by-slug"],
  {
    revalidate: 3600,
    tags: [MENU_CACHE_TAG, PRODUCT_CACHE_TAG],
  },
);
