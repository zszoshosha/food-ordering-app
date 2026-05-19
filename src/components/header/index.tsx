import React from "react";
import Link from "../link";
import { Routes } from "@/constants/enums";
import Navbar from "./Navbar";
import LanguageSwitcher from "../language-switcher";

/**
 * Header component for the site navigation.
 * Contains the logo, language switcher dropdown, and navigation menu.
 * The LanguageSwitcher was added to allow users to change language from any page.
 */
const Header = () => {
  return (
    <header className="sticky top-0 z-30 py-4 md:py-6 backdrop-blur-xl bg-background/80 border-b border-border/60">
      <div className="container flex items-center justify-between gap-4">
        <Link
          className="text-primary font-display font-semibold text-2xl tracking-tight"
          href={Routes.ROOT}
        >
          🍕 pizza
        </Link>
        <div className="flex items-center gap-4">
          {/* Language switcher dropdown for changing locale (en/ar) */}
          <LanguageSwitcher />
          <Navbar />
        </div>
      </div>
    </header>
  );
};

export default Header;
