import React from "react";
import Link from "../link";
import { Routes } from "@/constants/enums";
import Navbar from "./Navbar";

/**
 * Header component for the site navigation.
 * Contains the logo and navigation menu.
 */
const Header = () => {
  return (
    <header className="py-4 md:py-6">
      <div className="container flex">
        <Link className="text-primary font-semibold text-2xl" href={Routes.ROOT}>🍕 pizza</Link>
        <Navbar />
      </div>
    </header>
  );
};

export default Header;
