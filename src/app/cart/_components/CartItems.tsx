/**
 * CartItems Component
 * Displays all items in the shopping cart with details (size, extras, quantity)
 * Allows users to modify quantities, remove items, and manage their cart
 * Also handles persistence of cart to localStorage
 */
"use client";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  selectCartItems,
  removeCartItem,
  removeItemFromCart,
  addCartItem,
  hydrateCart,
} from "@/redux/features/cartSlice";
import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import { getCartItemTotal } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";
import { useEffect, useState } from "react";

const CartItems = () => {
  const items = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  // Track whether localStorage data has been loaded into Redux
  const [isHydrated, setIsHydrated] = useState(false);

  /**
   * On mount: Load persisted cart items from localStorage into Redux store.
   * This solves the SSR hydration mismatch — Redux starts with an empty cart
   * on the server, and we restore the real cart data on the client after mount.
   */
  useEffect(() => {
    try {
      const storedItems = window.localStorage.getItem("cartItems");
      const parsedItems = storedItems ? JSON.parse(storedItems) : [];
      dispatch(hydrateCart(parsedItems));
    } catch {
      // If localStorage is corrupted or unavailable, start with empty cart
      dispatch(hydrateCart([]));
    } finally {
      setIsHydrated(true);
    }
  }, [dispatch]);

  /**
   * Persist cart items to localStorage whenever they change.
   * Only runs after hydration is complete to prevent overwriting
   * persisted data with the initial empty Redux state.
   */
  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem("cartItems", JSON.stringify(items));
  }, [items, isHydrated]);

  /**
   * Increase quantity of an item by 1
   * Dispatches addCartItem action which handles duplicate detection
   */
  const handleIncreaseQuantity = (item: any) => {
    dispatch(addCartItem(item));
  };

  /**
   * Decrease quantity of an item by 1
   * Removes item completely if quantity reaches 0
   */
  const handleDecreaseQuantity = (id: string) => {
    dispatch(removeCartItem({ id }));
  };

  /**
   * Remove an item completely from the cart
   */
  const handleRemoveItem = (id: string) => {
    dispatch(removeItemFromCart({ id }));
  };

  // Show empty state if no items in cart
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }

  // Render cart items with details and controls
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">
        Your Cart ({items.length} {items.length === 1 ? "Item" : "Items"})
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex gap-4 border-b pb-4 last:border-b-0"
          >
            {/* Product Image */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{item.name}</h3>

              {/* Size */}
              {item.size && (
                <p className="text-sm text-gray-600">
                  Size: <span className="font-medium">{item.size.name}</span> (
                  {formatCurrency(item.size.price)})
                </p>
              )}

              {/* Extras */}
              {item.extras && item.extras.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Extras:</span>
                  <ul className="ml-4 list-disc">
                    {item.extras.map((extra, idx) => (
                      <li key={idx}>
                        {extra.name} ({formatCurrency(extra.price)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => handleDecreaseQuantity(item.id)}
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-semibold w-8 text-center">
                  {item.quantity || 1}
                </span>
                <button
                  onClick={() => handleIncreaseQuantity(item)}
                  className="p-1 rounded-full hover:bg-gray-100 transition"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price and Remove */}
            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700 transition"
                aria-label="Remove item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(getCartItemTotal(item))}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartItems;
