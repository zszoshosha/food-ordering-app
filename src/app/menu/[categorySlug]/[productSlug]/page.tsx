import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getMenuCatalogCached,
  getProductBySlugByDb,
} from "@/server/db/product";
import { slugify } from "@/lib/utils";

const BRAND_NAME = "Pizza Palace";
const FALLBACK_DESCRIPTION =
  "Discover this menu item at Pizza Palace and order it fresh online.";
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjQwJyBoZWlnaHQ9JzY0MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2cnIHgxPScwJyB4Mj0nMScgeTE9JzAnIHkyPScxJz48c3RvcCBvZmZzZXQ9JzAlJyBzdG9wLWNvbG9yPScjZjNlOGQ3Jy8+PHN0b3Agb2Zmc2V0PScxMDAlJyBzdG9wLWNvbG9yPScjZjFkNWMzJy8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9JzY0MCcgaGVpZ2h0PSc2NDAnIGZpbGw9J3VybCgjZyknLz48L3N2Zz4=";

export const revalidate = 3600;

interface MenuProductRouteParams {
  categorySlug: string;
  productSlug: string;
}

interface MenuProductPageProps {
  params: Promise<MenuProductRouteParams>;
}

export async function generateStaticParams(): Promise<
  MenuProductRouteParams[]
> {
  const products = await getMenuCatalogCached();

  return products
    .filter((product) => Boolean(product.slug))
    .map((product) => ({
      categorySlug: product.categorySlug || slugify(String(product.category)),
      productSlug: String(product.slug),
    }));
}

const getProductByRouteSlugs = async (
  categorySlug: string,
  productSlug: string,
) => {
  const product = await getProductBySlugByDb(productSlug);

  if (!product) {
    return null;
  }

  const normalizedCategorySlug =
    product.categorySlug || slugify(String(product.category));

  if (normalizedCategorySlug !== categorySlug) {
    return null;
  }

  return product;
};

export async function generateMetadata({
  params,
}: MenuProductPageProps): Promise<Metadata> {
  const { categorySlug, productSlug } = await params;
  const product = await getProductByRouteSlugs(categorySlug, productSlug);

  if (!product) {
    return {
      title: "Product Not Found | " + BRAND_NAME,
      description: FALLBACK_DESCRIPTION,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = product.name + " | " + BRAND_NAME;
  const description = product.description?.trim() || FALLBACK_DESCRIPTION;
  const imageUrl = product.image;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: imageUrl,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function MenuProductPage({
  params,
}: MenuProductPageProps) {
  const { categorySlug, productSlug } = await params;
  const product = await getProductByRouteSlugs(categorySlug, productSlug);

  if (!product) {
    notFound();
  }

  return (
    <main className="page-surface min-h-screen py-10 md:py-14">
      <section className="container mx-auto px-4">
        <article className="mx-auto grid max-w-5xl grid-cols-1 gap-8 rounded-2xl border border-border/60 bg-white/70 p-6 shadow-sm backdrop-blur md:grid-cols-2 md:p-8">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 92vw, (max-width: 1280px) 50vw, 640px"
              loading="lazy"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              quality={80}
            />
          </div>

          <div className="flex flex-col justify-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary/80">
              {product.category}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              {product.description || FALLBACK_DESCRIPTION}
            </p>

            <div className="mt-6 rounded-xl border border-border/60 bg-background/80 p-4">
              <p className="text-sm text-muted-foreground">Starting from</p>
              <p className="text-2xl font-semibold text-foreground">
                ${Number(product.basePrice).toFixed(2)}
              </p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
