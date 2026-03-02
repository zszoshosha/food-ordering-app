import { useTranslations } from "next-intl";
import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";
import { GetproductsByDb } from "@/server/db/product";
import React from "react";

/**
 * Bestsellers component displays a section of best-selling menu items.
 * Fetches products from the database and renders them in a menu grid.
 */
const Bestsellers = async () => {
  const bestSellers = await GetproductsByDb();

  return (
    <section>
      <div className="container">
        <div className="text-center mb-4">
          <BestsellersTitle />
        </div>
        <Menu items={bestSellers} />
      </div>
    </section>
  );
};

function BestsellersTitle() {
  const t = useTranslations("bestsellers");
  return <MainHeading title={t("title")} subTitle={"checkout"} />;
}

export default Bestsellers;
