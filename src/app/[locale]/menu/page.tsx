"use client";
import React, { useState, useEffect } from "react";
import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { ProductWithRelations } from "@/types/Product";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

/**
 * Menu page component with category filtering.
 * Displays all menu items organized by categories.
 */
export default function MenuPage() {
  const t = useTranslations("menu");
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<
    ProductWithRelations[]
  >([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [loading, setLoading] = useState(true);
  const [hasFetchError, setHasFetchError] = useState(false);

  // Categories for pizza types (matching ProductCategory enum)
  const categories = [
    { id: "ALL", name: t("categories.all"), icon: "🍕" },
    { id: "CLASSIC", name: t("categories.classic"), icon: "🍕" },
    { id: "SPECIALTY", name: t("categories.specialty"), icon: "⭐" },
    { id: "VEGETARIAN", name: t("categories.vegetarian"), icon: "🥗" },
    { id: "MEAT", name: t("categories.meat"), icon: "🥓" },
    { id: "SEAFOOD", name: t("categories.seafood"), icon: "🦐" },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    setHasFetchError(false);

    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch products");
      const data: ProductWithRelations[] = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setHasFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const next = products
      .filter((product) =>
        activeCategory === "ALL" ? true : product.category === activeCategory,
      )
      .filter((product) => {
        if (!normalizedSearch) return true;
        return (
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.description.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((a, b) => {
        const minA = Math.min(...a.sizes.map((s) => Number(s.price || 0)), 0);
        const minB = Math.min(...b.sizes.map((s) => Number(s.price || 0)), 0);
        const priceA = Number(a.basePrice || 0) + minA;
        const priceB = Number(b.basePrice || 0) + minB;

        switch (sortBy) {
          case "price-asc":
            return priceA - priceB;
          case "price-desc":
            return priceB - priceA;
          case "name-desc":
            return b.name.localeCompare(a.name);
          case "name-asc":
          default:
            return a.name.localeCompare(b.name);
        }
      });

    setFilteredProducts(next);
  }, [products, activeCategory, searchTerm, sortBy]);

  return (
    <main className="py-10 md:py-14 page-surface">
      <div className="container mx-auto px-4">
        <MainHeading title={t("title")} subTitle={t("subtitle")} />

        <div className="mt-8 mb-6 grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full h-11 rounded-xl border border-border bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            aria-label={t("searchAria")}
          />

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-11 rounded-xl border border-border bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            aria-label={t("sortAria")}
          >
            <option value="name-asc">{t("sort.nameAsc")}</option>
            <option value="name-desc">{t("sort.nameDesc")}</option>
            <option value="price-asc">{t("sort.priceAsc")}</option>
            <option value="price-desc">{t("sort.priceDesc")}</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12 mt-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              variant={activeCategory === category.id ? "default" : "outline"}
              className="min-w-30 rounded-full"
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">{t("loading")}</p>
          </div>
        )}

        {/* Menu Items */}
        {!loading && filteredProducts.length > 0 && (
          <Menu items={filteredProducts} />
        )}

        {/* No Products */}
        {!loading && hasFetchError && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">{t("error")}</p>
            <Button onClick={fetchProducts} className="mt-5 rounded-full">
              {t("retry")}
            </Button>
          </div>
        )}

        {/* No Products */}
        {!loading && !hasFetchError && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">{t("empty")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
