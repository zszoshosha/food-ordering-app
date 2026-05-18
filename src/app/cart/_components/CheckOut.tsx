"use client";
import React from "react";
import Link from "next/link";
import { useAppSelector } from "@/redux/hooks";
import { selectCartItems } from "@/redux/features/cartSlice";
import { Button } from "@/components/ui/button";
import { getTotal } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";

/**
 * Order summary panel with subtotal, tax, shipping, and checkout actions.
 */
const CheckOut = () => {
  const items = useAppSelector(selectCartItems);
  const subtotal = getTotal(items);
  const tax = subtotal * 0.1;
  const shipping = items.length > 0 ? 0 : 0;
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <span className="text-gray-600">Subtotal:</span>
        <span className="text-right font-medium">
          {formatCurrency(subtotal)}
        </span>

        <span className="text-gray-600">Tax (10%):</span>
        <span className="text-right font-medium">{formatCurrency(tax)}</span>

        <span className="text-gray-600">Shipping:</span>
        <span className="text-right font-medium">
          {formatCurrency(shipping)}
        </span>

        <div className="col-span-2 border-t pt-3 mt-2">
          <div className="grid grid-cols-2">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-right text-lg font-bold text-green-600">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      <Button
        className="w-full mb-3"
        size="lg"
        disabled={items.length === 0}
        asChild
      >
        <Link href="/pay">Proceed to Checkout</Link>
      </Button>

      <Button variant="outline" className="w-full" asChild>
        <Link href="/menu">Continue Shopping</Link>
      </Button>
    </div>
  );
};

export default CheckOut;
