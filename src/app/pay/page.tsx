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

const PayPage = () => {
  const items = useAppSelector(selectCartItems);
  const subtotal = getTotal(items);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto grid gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-1">Checkout</h1>
          <p className="text-muted-foreground mb-6">
            Enter your details to complete the order.
          </p>

          <form className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" placeholder="John Doe" />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+1 555 000 1234" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@email.com" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="Street, building, unit" />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="City" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zip">ZIP code</Label>
                <Input id="zip" placeholder="00000" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Delivery notes</Label>
              <Textarea id="notes" placeholder="Leave at the door..." />
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {items.length === 0 ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Button className="w-full" size="lg" disabled={items.length === 0}>
              Pay Now
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/cart">Back to Cart</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPage;
