"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/redux/hooks";
import { selectCartItems } from "@/redux/features/cartSlice";
import { getTotal } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

const PayPage = () => {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const params = useParams();
  const locale = params.locale as string;

  const items = useAppSelector(selectCartItems);
  const subtotal = getTotal(items);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto grid gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-1">{t("title")}</h1>
          <p className="text-muted-foreground mb-6">{t("personalInfo")}</p>

          <form className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="fullName">{t("name")}</Label>
              <Input id="fullName" placeholder={t("name")} />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input id="phone" placeholder="+1 555 000 1234" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" placeholder={t("email")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Input id="address" placeholder={t("address")} />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="city">{t("city")}</Label>
                <Input id="city" placeholder={t("city")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">{t("zipCode")}</Label>
                <Input id="zip" placeholder="00000" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">{t("deliveryInfo")}</Label>
              <Textarea id="notes" placeholder={t("deliveryInfo")} />
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">{tCart("title")}</h2>
          {items.length === 0 ? (
            <p className="text-gray-600">{tCart("empty")}</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{tCart("subtotal")}</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{tCart("tax")} (10%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {tCart("grandTotal")}
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Button className="w-full" size="lg" disabled={items.length === 0}>
              {t("placeOrder")}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/${locale}/cart`}>{tCart("continueShopping")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPage;
