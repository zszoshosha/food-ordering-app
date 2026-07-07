import type { MetadataRoute } from "next";
import { getProductsByDb } from "@/server/db/product";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "https://food-ordering-app-one-phi.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL + "/",
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: SITE_URL + "/menu",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: SITE_URL + "/cart",
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  const products = await getProductsByDb();

  const dynamicProductRoutes: MetadataRoute.Sitemap = products
    .filter((product) => product.categorySlug && product.slug)
    .map((product) => ({
      url: SITE_URL + "/menu/" + product.categorySlug + "/" + product.slug,
      lastModified: product.updateAt ?? product.createdAt ?? now,
      changeFrequency: "daily",
      priority: 0.8,
    }));

  return [...staticRoutes, ...dynamicProductRoutes];
}
