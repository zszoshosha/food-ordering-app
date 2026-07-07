"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearCart, selectCartItems } from "@/redux/features/cartSlice";
import { getTotal } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import { ActionResponse } from "@/types/action-response";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";

/**
 * Localized checkout page UI rendered on the client.
 */
const PayPageClient = ({ locale }: { locale: string }) => {
  const t = useTranslations("checkout");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = useAppSelector(selectCartItems);
  const subtotal = useMemo(() => getTotal(items), [items]);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const estimatedRange = t("etaWindow");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (items.length === 0 || isSubmitting) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      zipCode: String(formData.get("zipCode") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      total: Number(total.toFixed(2)),
      items: items.map((item) => ({
        productId: item.id,
        quantity: item.quantity ?? 1,
        sizeId: item.size?.id,
        extraIds: item.extras?.map((extra) => extra.id) ?? [],
      })),
    };

    let checkoutToastId: string | number | undefined;

    try {
      setIsSubmitting(true);
      checkoutToastId = toast.loading(t("processing"));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as ActionResponse<{
        id: string;
        total: number;
        createdAt: string;
      }>;

      if (!response.ok) {
        const errorMessage = !result.success ? result.error : t("orderError");
        toast.error(errorMessage ?? t("orderError"), {
          id: checkoutToastId,
          className: "bg-red-500 text-white",
        });
        return;
      }

      if (!result.success) {
        toast.error(result.error ?? t("orderError"), {
          id: checkoutToastId,
          className: "bg-red-500 text-white",
        });
        return;
      }

      toast.loading("Preparing payment...", {
        id: checkoutToastId,
      });

      const paymentIntentResponse = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: result.data.id }),
      });

      const paymentIntentResult =
        (await paymentIntentResponse.json()) as ActionResponse<{
          orderId: string;
          paymentIntentId: string;
          clientSecret: string;
          simulated: boolean;
        }>;

      if (!paymentIntentResponse.ok || !paymentIntentResult.success) {
        toast.error(
          !paymentIntentResult.success
            ? paymentIntentResult.error
            : t("orderError"),
          {
            id: checkoutToastId,
            className: "bg-red-500 text-white",
          },
        );
        return;
      }

      if (paymentIntentResult.data.simulated) {
        toast.loading("Confirming payment...", {
          id: checkoutToastId,
        });

        const confirmResponse = await fetch("/api/stripe/mock-confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: paymentIntentResult.data.orderId,
            paymentIntentId: paymentIntentResult.data.paymentIntentId,
          }),
        });

        const confirmResult = (await confirmResponse.json()) as ActionResponse<{
          orderId: string;
          status: number;
          paymentIntentId: string;
        }>;

        if (!confirmResponse.ok || !confirmResult.success) {
          toast.error(
            !confirmResult.success ? confirmResult.error : t("orderError"),
            {
              id: checkoutToastId,
              className: "bg-red-500 text-white",
            },
          );
          return;
        }
      }

      dispatch(clearCart());
      toast.success(t("orderSuccess"), {
        id: checkoutToastId,
        className: "bg-green-500 text-white",
      });

      router.push(`/${locale}/profile`);
      router.refresh();
    } catch {
      toast.error(t("orderError"), {
        id: checkoutToastId,
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto grid gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-1">{t("title")}</h1>
          <p className="text-muted-foreground mb-6">{t("personalInfo")}</p>

          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-primary">{t("etaTitle")}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {t("etaText", { range: estimatedRange })}
            </p>
          </div>

          <form className="grid gap-5" onSubmit={onSubmit} id="checkout-form">
            <div className="grid gap-2">
              <Label htmlFor="fullName">{t("name")}</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder={t("name")}
                required
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 555 000 1234"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("email")}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Input
                id="address"
                name="address"
                placeholder={t("address")}
                required
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="city">{t("city")}</Label>
                <Input id="city" name="city" placeholder={t("city")} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">{t("zipCode")}</Label>
                <Input id="zip" name="zipCode" placeholder="00000" required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">{t("deliveryInfo")}</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder={t("deliveryInfo")}
              />
            </div>

            <Button
              className="w-full"
              size="lg"
              type="submit"
              disabled={items.length === 0 || isSubmitting}
            >
              {isSubmitting ? t("processing") : t("placeOrder")}
            </Button>
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
            <p className="text-sm text-muted-foreground">{t("trackHint")}</p>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/${locale}/cart`}>{tCart("continueShopping")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPageClient;
