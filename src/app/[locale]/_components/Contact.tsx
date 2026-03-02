"use client";

import { useTranslations } from "next-intl";
import React from "react";
import MainHeading from "@/components/main-heading";
import Link from "@/components/link";
import { Routes } from "@/constants/enums";
import { Button } from "@/components/ui/button";

/**
 * Contact section component for the home page.
 * Displays quick contact information with a call-to-action.
 */
const Contact = () => {
  const t = useTranslations("contact");

  return (
    <section className="py-16">
      <div className="container">
        <MainHeading title={t("title")} subTitle={t("title")} />
        <div className="mt-12 max-w-4xl mx-auto">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📞</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Call Us</h3>
              <p className="text-gray-600">{t("phone")}</p>
              <p className="text-sm text-gray-500 mt-1">11 AM - 11 PM Daily</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Email Us</h3>
              <p className="text-gray-600">{t("emailAddress")}</p>
              <p className="text-sm text-gray-500 mt-1">24/7 Support</p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Visit Us</h3>
              <p className="text-gray-600">{t("address")}</p>
              <p className="text-sm text-gray-500 mt-1">Food City, FC 12345</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-primary text-white rounded-lg p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("getInTouch")}</h2>
            <p className="text-lg mb-8 opacity-90 text-balance">
              {t("subtitle")}
            </p>
            <Link href={`/${Routes.CONTACT}`}>
              <Button size="lg" variant="secondary" className="text-primary">
                {t("title")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
