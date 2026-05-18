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
  const [loading, setLoading] = useState(true);

  // Categories for pizza types (matching ProductCategory enum)
  const categories = [
    { id: "ALL", name: t("categories.all"), icon: "🍕" },
    { id: "CLASSIC", name: "Classic", icon: "🍕" },
    { id: "SPECIALTY", name: "Specialty", icon: "⭐" },
    { id: "VEGETARIAN", name: "Vegetarian", icon: "🥗" },
    { id: "MEAT", name: "Meat Lovers", icon: "🥓" },
    { id: "SEAFOOD", name: "Seafood", icon: "🦐" },
  ];

  useEffect(() => {
    // Fetch products on mount
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data: ProductWithRelations[] = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by category using the database category field
  const filterByCategory = (category: string) => {
    setActiveCategory(category);
    if (category === "ALL") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) => product.category === category,
      );
      setFilteredProducts(filtered);
    }
  };

  return (
    <main className="py-8">
      <div className="container mx-auto px-4">
        <MainHeading title={t("title")} subTitle={t("subtitle")} />

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => filterByCategory(category.id)}
              variant={activeCategory === category.id ? "default" : "outline"}
              className="min-w-30"
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
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">{t("error")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
