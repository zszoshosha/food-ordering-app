import MainHeading from "@/components/main-heading";
import Menu from "@/components/menu";

import React from "react";

const Bestsellers = () => {
  const bestSellers = [
    {
      id: crypto.randomUUID(),
      name: "pizza",
      description: "this is a pizza",
      basePrice: 12,
      image: "/assets/images/pizza.png",
    },
    {
      id: crypto.randomUUID(),
      name: "pizza",
      description: "this is a pizza",
      basePrice: 12,
      image: "/assets/images/pizza.png",
    },
    {
      id: crypto.randomUUID(),
      name: "pizza",
      description: "this is a pizza",
      basePrice: 12,
      image: "/assets/images/pizza.png",
    },
    {
      id: crypto.randomUUID(),
      name: "pizza",
      description: "this is a pizza",
      basePrice: 12,
      image: "/assets/images/pizza.png",
    },
  ];
  return (
    <section>
      <div className="container">
        <div className="text-center mb-4">
          <MainHeading title={"our best sellers"} subTitle={"checkout"} />
        </div>
<Menu items={bestSellers}/>
      </div>
    </section>
  );
};

export default Bestsellers;
