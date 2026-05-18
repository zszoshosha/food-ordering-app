"use client";
import React, { useState } from "react";
import Link from "../link";
import { Routes } from "@/constants/enums";
import { Button, buttonVariants } from "../ui/button";
import { Menu, XIcon, ShoppingCart } from "lucide-react";
import { selectCartItems } from "@/redux/features/cartSlice";
import { getCartQuantity } from "@/lib/cart";
import { usePathname, useParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { useTranslations } from "next-intl";
import AuthButtons from "./AuthButtons";

/**
 * Generates navigation links with translated titles.
 * Uses the next-intl translation function (t) to get localized link labels.
 * Each link has a unique ID, translated title, route href, and optional flags.
 * @param t - The translation function from useTranslations()
 */
const getLinks = (t: (key: string) => string) => [
  { id: "menu", title: t("common.menu"), href: Routes.MENU },
  { id: "about", title: t("common.about"), href: Routes.ABOUT },
  { id: "contact", title: t("common.contact"), href: Routes.CONTACT },
  {
    id: "cart",
    title: t("common.cart"),
    href: Routes.CART,
    isCart: true,
  },
];

/**
 * Navbar component handles site navigation with a mobile-responsive menu.
 * Toggles between open and closed states on mobile.
 */
const Navbar = () => {
  // Get translation function for localized nav labels
  const t = useTranslations();
  const [openMenu, setOpenMenu] = useState(false);
  const Cart = useAppSelector(selectCartItems);
  const cartQuantity = getCartQuantity(Cart);
  const pathname = usePathname();
  const params = useParams();
  // Extract locale from URL params for locale-aware link matching and RTL support
  const locale = params.locale as string;
  const isArabic = locale === "ar";

  // Generate navigation links with translated titles
  const links = getLinks(t);

  /**
   * Checks if a navigation link is currently active.
   * Constructs the full localized href (e.g., /en/menu) and compares with pathname.
   */
  const isActiveLink = (href: string) => {
    const localizedHref = `/${locale}${href.startsWith("/") ? href : "/" + href}`;
    return pathname === localizedHref;
  };

  return (
    <nav className="flex-1 justify-end flex transition-all duration-300">
      {/* Mobile Menu Toggle */}
      <Button
        variant="secondary"
        size="sm"
        className="lg:hidden hover:scale-105 transition-transform"
        onClick={() => setOpenMenu(true)}
        aria-label="Open menu"
      >
        <Menu className="w-6! h-6!" />
      </Button>

      {/* Backdrop Overlay */}
      {openMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setOpenMenu(false)}
          aria-hidden="true"
        />
      )}

      {/* Navigation Menu */}
      <ul
        className={`fixed lg:static ${
          openMenu
            ? isArabic
              ? "right-0 z-50"
              : "left-0 z-50"
            : isArabic
              ? "right-full"
              : "left-full"
        } top-0 px-10 py-20 lg:p-0 bg-background lg:bg-transparent transition-all duration-300 ease-in-out h-full lg:h-auto flex-col lg:flex-row w-70 sm:w-[320px] lg:w-auto flex items-start lg:items-center gap-8 lg:gap-6 shadow-2xl lg:shadow-none ${isArabic ? "border-l" : "border-r"} lg:border-0`}
      >
        {/* Mobile Close Button */}
        <Button
          variant="secondary"
          size="sm"
          className={`absolute top-6 ${isArabic ? "left-6" : "right-6"} lg:hidden hover:scale-105 transition-transform`}
          onClick={() => setOpenMenu(false)}
          aria-label="Close menu"
        >
          <XIcon className="w-6! h-6!" />
        </Button>

        {/* Navigation Links */}
        {links.map((link) => {
          const isActive = isActiveLink(link.href);

          return (
            <li
              key={link.id}
              onClick={() => setOpenMenu(false)}
              className="w-full lg:w-auto"
            >
              <Link
                href={`/${link.href}`}
                className={`${
                  link.isCart
                    ? `${buttonVariants({ size: "lg", variant: "outline" })} relative flex items-center gap-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200 ${isActive ? "bg-primary/10 border-primary" : ""}`
                    : `hover:text-primary duration-200 transition-colors relative ${isActive ? "text-primary font-bold" : ""}`
                } font-semibold capitalize`}
              >
                {link.isCart ? (
                  <>
                    <ShoppingCart className="w-5! h-5!" />
                    {cartQuantity > 0 && (
                      <span
                        className={`absolute -top-3 ${isArabic ? "-left-3" : "-right-3"} bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold`}
                      >
                        {cartQuantity}
                      </span>
                    )}
                    <span className="hidden sm:inline">{link.title}</span>
                  </>
                ) : (
                  <>
                    {link.title}
                    {isActive && !link.isCart && (
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </>
                )}
              </Link>
            </li>
          );
        })}

        <li className="w-full lg:w-auto">
          <AuthButtons
            onNavigate={() => setOpenMenu(false)}
            className="w-full lg:w-auto flex flex-col lg:flex-row items-start lg:items-center gap-3"
          />
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
