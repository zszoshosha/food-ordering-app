"use client";
import CartItems from "../../cart/_components/CartItems";
import CheckOut from "../../cart/_components/CheckOut";
import { useTranslations } from "next-intl";

const CartPage = () => {
  const t = useTranslations("cart");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t("title")}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartItems />
        </div>
        <div className="lg:col-span-1">
          <CheckOut />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
