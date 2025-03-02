"use client";
import React, { useState } from "react";
import Link from "../link";
import { Pages, Routes } from "@/constants/enums";
import { Button, buttonVariants } from "../ui/button";
import { Menu, XIcon } from "lucide-react";

const links = [
  { id: crypto.randomUUID(), title: "Menu", href: Routes.MENU },
  { id: crypto.randomUUID(), title: "About", href: Routes.ABOUT },
  { id: crypto.randomUUID(), title: "contact", href: Routes.CONTACT },
  {
    id: crypto.randomUUID(),
    title: "Login",
    href: `${Routes.AUTH}/${Pages.LOGIN}`,
  },
];

const Navbar = () => {
  const [openMenu,setopenmenu] = useState(false)

  return (
    <nav className="flex-1 justify-end flex transition-all duration-300">
      <Button variant='secondary' size='sm' className="lg:hidden" onClick={()=>setopenmenu(true)}> <Menu className="!w-6 !h-6" /></Button>
      <ul className={`fixed lg:static ${
        openMenu ? 'left-o z-50' : 'left-full'
      } top-0 px-10 py-20 lg:p-0 bg-background  lg:bg-transparent transition-all duration-600 h-full lg:h-auto flex-col lg:flex-row w-full lg:w-auto flex items-start lg:items-center gap-10`}>
            <Button variant='secondary' size='sm' className="absolute top-10 right-10 lg:hidden" onClick={()=>setopenmenu(false)}> <XIcon className="!w-6 !h-6" /></Button>

        {links.map((link) => (
          <li key={link.id}>
            <Link href={`/${link.href}`} className={`${link.href === `${Routes.AUTH}/${Pages.LOGIN}`?`${buttonVariants({size: "lg"})} !px-8 rounded-full `:"hover:text-primary duration-200 transition-colors "}font-semibold`}>{link.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
