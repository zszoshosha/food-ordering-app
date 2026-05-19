import React from "react";
import Link from "../link";
import { Routes } from "@/constants/enums";

/**
 * Footer component for the application.
 * Displays links, company info, and copyright information.
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16 border-t border-slate-800">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white text-2xl font-display font-semibold mb-4">
              🍕 Pizza Palace
            </h3>
            <p className="text-sm text-slate-400">
              Delivering delicious pizzas and quality food to your doorstep
              since 2020.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={Routes.ROOT}
                  className="hover:text-primary transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href={`/${Routes.MENU}`}
                  className="hover:text-primary transition-colors"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  href={`/${Routes.ABOUT}`}
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href={`/${Routes.CONTACT}`}
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Feedback
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2">📞</span>
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📧</span>
                <span>info@pizzapalace.com</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📍</span>
                <span>123 Main Street, Food City</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🕐</span>
                <span>11:00 AM - 11:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex justify-center gap-6 mb-6">
            <a
              href="#"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              Facebook
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              Twitter
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-primary transition-colors"
            >
              Instagram
            </a>
          </div>

          <div className="text-center text-sm text-slate-500">
            <p>&copy; {currentYear} Pizza Palace. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
