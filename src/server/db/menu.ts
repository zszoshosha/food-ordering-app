import { db, withPrismaRetry } from "@/lib/prisma";
import { ProductWithRelations } from "@/types/Product";
import { unstable_cache } from "next/cache";
import { cache } from "react";

export const MENU_CACHE_TAG = "menu";

export const getMenuItemsCached = unstable_cache(
  cache(async (): Promise<ProductWithRelations[]> => {
    try {
      return await withPrismaRetry(() =>
        db.product.findMany({
          include: { sizes: true, extras: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        }),
      );
    } catch (error) {
      console.error("Failed to load menu items from database:", error);
      return [] as ProductWithRelations[];
    }
  }),
  ["menu-items"],
  {
    revalidate: 3600,
    tags: [MENU_CACHE_TAG],
  },
);
