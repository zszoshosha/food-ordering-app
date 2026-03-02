"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("about");

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <MainHeading title={t("title")} subTitle={t("title")} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-start">
            <h2 className="text-3xl font-bold text-gray-900">
              {t("headline")}
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {t("description1")}
            </p>
            <p className="text-gray-600 leading-relaxed">{t("description2")}</p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href={`/${Routes.ABOUT}`}>
                <Button size="lg">{t("title")}</Button>
              </Link>
              <Link href={`/${Routes.MENU}`}>
                <Button size="lg" variant="outline">
                  {t("title")}
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
