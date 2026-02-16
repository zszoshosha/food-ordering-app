import { Cache } from "@/lib/cache";
import { db } from "@/lib/prisma";

export const GetproductsByDb = Cache(
  () => {
    const bestSellers = db.product.findMany({
      include: { sizes: true, extras: true },
    });
    return bestSellers;
  },
  ["best-sellers"],
  { revalidate: 3600 }
);
