import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { db } from "@/lib/prisma";
import { getProductsByDb } from "@/server/db/product";

import React from "react";
/**
 * Bestsellers component displays a section of best-selling menu items.
 * Fetches products from the database and renders them in a menu grid.
 */
const Bestsellers = async () => {
  const bestSellers = await getProductsByDb();

  return (
    <section>
      <div className="container">
        <div className="text-center mb-4">
          <MainHeading title={"our best sellers"} subTitle={"checkout"} />
        </div>
        <Menu items={bestSellers} />
      </div>
    </section>
  );
};

export default Bestsellers;
