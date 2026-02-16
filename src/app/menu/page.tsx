"use client";
import { GetproductsByDb } from "@/server/db/product";
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
  const [loading, setLoading] = useState(true);

  // Categories for pizza types (matching ProductCategory enum)
  const categories = [
    { id: "ALL", name: "All Pizzas", icon: "🍕" },
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
        const data = await GetproductsByDb();
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
        (product) => product.category === category
      );
      setFilteredProducts(filtered);
    }
  };

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
    <main className="min-h-screen">
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

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => filterByCategory(category.id)}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="lg"
                className="min-w-[120px]"
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
        {filteredProducts.length > 0 ? (
          <Menu items={filteredProducts} />
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😔</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No pizzas found
            </h3>
            <p className="text-gray-600 mb-6">
              Try selecting a different category
            </p>
            <Button onClick={() => filterByCategory("ALL")}>
              View All Pizzas
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-16 bg-gray-50 rounded-lg p-8">
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
