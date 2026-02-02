import React from "react";
import MainHeading from "@/components/main-heading";
import Link from "@/components/link";
import { Routes } from "@/constants/enums";
import { Button } from "@/components/ui/button";

/**
 * About section component for the home page.
 * Displays a brief overview of the company with a call-to-action.
 */
const About = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <MainHeading title="About Us" subTitle="our story" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Serving Delicious Pizzas Since 2020
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              At Pizza Palace, we're passionate about creating authentic Italian
              pizzas using only the freshest ingredients. Our mission is to
              bring joy to every meal and create unforgettable dining
              experiences for our customers.
            </p>
            <p className="text-gray-600 leading-relaxed">
              From our signature hand-tossed dough to our premium toppings,
              every pizza is crafted with care and delivered with a smile.
              Whether you're dining in, taking out, or ordering delivery, we
              guarantee quality and satisfaction.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href={`/${Routes.ABOUT}`}>
                <Button size="lg">Learn More</Button>
              </Link>
              <Link href={`/${Routes.MENU}`}>
                <Button size="lg" variant="outline">
                  View Menu
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Stats/Features */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-primary mb-2">5+</div>
              <p className="text-gray-600">Years of Excellence</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-gray-600">Menu Items</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-gray-600">Fresh Ingredients</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
