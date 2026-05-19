"use client";
import React, { useState, useEffect } from "react";
import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { ProductWithRelations } from "@/types/Product";
import { Button } from "@/components/ui/button";

/**
 * Menu page component with category filtering.
 * Displays all menu items organized by categories.
 */
export default function MenuPage() {
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
    { id: "ALL", name: "All Pizzas", icon: "🍕" },
    { id: "CLASSIC", name: "Classic", icon: "🍕" },
    { id: "SPECIALTY", name: "Specialty", icon: "⭐" },
    { id: "VEGETARIAN", name: "Vegetarian", icon: "🥗" },
    { id: "MEAT", name: "Meat Lovers", icon: "🥓" },
    { id: "SEAFOOD", name: "Seafood", icon: "🦐" },
  ];

  /**
   * Fetch products from the API route.
   * Uses the API route so Prisma stays server-side.
   */
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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍕</div>
          <p className="text-gray-600">Loading delicious pizzas...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen page-surface">
      <div className="container py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <MainHeading title="Our Menu" subTitle="Explore" />
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-lg">
            Browse our delicious selection of pizzas, made fresh with premium
            ingredients. Customize your order with different sizes and extra
            toppings!
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by pizza name or ingredient..."
            className="w-full h-11 rounded-xl border border-border bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            aria-label="Search pizzas"
          />

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-11 rounded-xl border border-border bg-white/70 px-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary"
            aria-label="Sort menu"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="lg"
                className="min-w-30 rounded-full"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold text-primary">
              {filteredProducts.length}
            </span>{" "}
            delicious{" "}
            {activeCategory !== "ALL" ? activeCategory.toLowerCase() : ""} pizza
            {filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Menu Grid */}
        {!hasFetchError && filteredProducts.length > 0 ? (
          <Menu items={filteredProducts} />
        ) : hasFetchError ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Could not load menu right now
            </h3>
            <p className="text-gray-600 mb-6">Please try again in a moment.</p>
            <Button onClick={fetchProducts} className="rounded-full">
              Retry
            </Button>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No pizzas match your filters
            </h3>
            <p className="text-gray-600 mb-6">
              Try another category or clear your search text
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setActiveCategory("ALL");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-white/75 backdrop-blur rounded-2xl p-8 border border-border/60 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Hot and fresh to your door in 30 minutes or less
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🌟</div>
              <h3 className="font-semibold text-lg mb-2">Premium Quality</h3>
              <p className="text-gray-600 text-sm">
                Made with fresh, locally-sourced ingredients
              </p>
            </div>
            <div>
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold text-lg mb-2">
                Customize Your Pizza
              </h3>
              <p className="text-gray-600 text-sm">
                Choose from multiple sizes and delicious toppings
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
