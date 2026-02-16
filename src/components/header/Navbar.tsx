"use client";
import React, { useState } from "react";
import Link from "../link";
import { Pages, Routes } from "@/constants/enums";
import { Button, buttonVariants } from "../ui/button";
import { Menu, XIcon, ShoppingCart } from "lucide-react";
import { selectCartItems } from "@/redux/features/cartSlice";
import { getCartQuantity } from "@/lib/cart";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";

/**
 * Navigation links for the site.
 */
const links = [
  { id: crypto.randomUUID(), title: "Menu", href: Routes.MENU },
  { id: crypto.randomUUID(), title: "About", href: Routes.ABOUT },
  { id: crypto.randomUUID(), title: "contact", href: Routes.CONTACT },
  { id: crypto.randomUUID(), title: "Cart", href: Routes.CART, isCart: true },
  {
    id: crypto.randomUUID(),
    title: "Login",
    href: `${Routes.AUTH}/${Pages.LOGIN}`,
  },
];

/**
 * Navbar component handles site navigation with a mobile-responsive menu.
 * Toggles between open and closed states on mobile.
 */
const Navbar = () => {
  const [openMenu, setopenmenu] = useState(false);
  const Cart = useAppSelector(selectCartItems);
  const cartQuantity = getCartQuantity(Cart);
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === Routes.CART && pathname === `/${Routes.CART}`) return true;
    if (href === Routes.MENU && pathname === `/${Routes.MENU}`) return true;
    if (href === Routes.ABOUT && pathname === `/${Routes.ABOUT}`) return true;
    if (href === Routes.CONTACT && pathname === `/${Routes.CONTACT}`)
      return true;
    if (
      href === `${Routes.AUTH}/${Pages.LOGIN}` &&
      pathname === `/${Routes.AUTH}/${Pages.LOGIN}`
    )
      return true;
    return false;
  };

  return (
    <nav className="flex-1 justify-end flex transition-all duration-300">
      {/* Mobile Menu Toggle */}
      <Button
        variant="secondary"
        size="sm"
        className="lg:hidden hover:scale-105 transition-transform"
        onClick={() => setopenmenu(true)}
        aria-label="Open menu"
      >
        <Menu className="!w-6 !h-6" />
      </Button>

      {/* Backdrop Overlay */}
      {openMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setopenmenu(false)}
          aria-hidden="true"
        />
      )}

      {/* Navigation Menu */}
      <ul
        className={`fixed lg:static ${
          openMenu ? "left-0 z-50" : "left-full"
        } top-0 px-10 py-20 lg:p-0 bg-background lg:bg-transparent transition-all duration-300 ease-in-out h-full lg:h-auto flex-col lg:flex-row w-[280px] sm:w-[320px] lg:w-auto flex items-start lg:items-center gap-8 lg:gap-6 shadow-2xl lg:shadow-none border-r lg:border-0`}
      >
        {/* Mobile Close Button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute top-6 right-6 lg:hidden hover:scale-105 transition-transform"
          onClick={() => setopenmenu(false)}
          aria-label="Close menu"
        >
          <XIcon className="!w-6 !h-6" />
        </Button>

        {/* Navigation Links */}
        {links.map((link) => {
          const isActive = isActiveLink(link.href);

          return (
            <li
              key={link.id}
              onClick={() => setopenmenu(false)}
              className="w-full lg:w-auto"
            >
              <Link
                href={`/${link.href}`}
                className={`${
                  link.isCart
                    ? `${buttonVariants({ size: "lg", variant: "outline" })} relative flex items-center gap-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200 ${isActive ? "bg-primary/10 border-primary" : ""}`
                    : link.href === `${Routes.AUTH}/${Pages.LOGIN}`
                      ? `${buttonVariants({ size: "lg" })} !px-8 rounded-full hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-primary to-primary/80`
                      : `hover:text-primary duration-200 transition-colors relative ${isActive ? "text-primary font-bold" : ""}`
                } font-semibold capitalize`}
              >
                {link.isCart ? (
                  <>
                    <ShoppingCart className="!w-5 !h-5" />
                    {cartQuantity > 0 && (
                      <span className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {cartQuantity}
                      </span>
                    )}
                    <span className="hidden sm:inline">Cart</span>
                  </>
                ) : (
                  <>
                    {link.title}
                    {isActive &&
                      !link.isCart &&
                      link.href !== `${Routes.AUTH}/${Pages.LOGIN}` && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                      )}
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navbar;
