import React from "react";
import MainHeading from "@/components/main-heading";

/**
 * About page component.
 * Displays information about the food ordering application.
 */
export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="container py-12 flex-1">
        <MainHeading title="About Us" subTitle="Learn more" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
          {/* Left Column */}
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Our Story
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to Pizza Palace, your ultimate destination for authentic
                Italian pizzas and delicious food. Founded in 2020, we've been
                serving our community with passion, quality ingredients, and
                exceptional service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our mission is to deliver the finest quality pizzas and meals
                using only fresh, locally-sourced ingredients. We believe that
                great food brings people together, and we're committed to
                creating unforgettable dining experiences for every customer.
              </p>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Why Choose Us?
              </h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span>100% Fresh and Quality Ingredients</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span>Fast and Reliable Delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span>Customizable Menu Options</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span>Professional and Friendly Team</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span>Competitive Prices</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">
                Contact Info
              </h2>
              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
                <p>
                  <strong>Email:</strong> info@pizzapalace.com
                </p>
                <p>
                  <strong>Address:</strong> 123 Main Street, Food City, FC 12345
                </p>
                <p>
                  <strong>Hours:</strong> Mon - Sun, 11:00 AM - 11:00 PM
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
