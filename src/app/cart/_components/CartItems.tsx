"use client";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import {
  selectCartItems,
  removeCartItem,
  removeItemFromCart,
  addCartItem,
} from "@/redux/features/cartSlice";
import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";

const CartItems = () => {
  const items = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  console.log("Cart Items:", items);

  const handleIncreaseQuantity = (item: any) => {
    dispatch(addCartItem(item));
  };

  const handleDecreaseQuantity = (id: string) => {
    dispatch(removeCartItem({ id }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeItemFromCart({ id }));
  };

  const calculateItemTotal = (item: any) => {
    let total = item.basePrice;
    if (item.size) {
      total += item.size.price;
    }
    if (item.extras && item.extras.length > 0) {
      total += item.extras.reduce(
        (sum: number, extra: any) => sum + extra.price,
        0,
      );
    }
    return total * (item.quantity || 1);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }

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
                  Size: <span className="font-medium">{item.size.name}</span>{" "}
                  (+${item.size.price.toFixed(2)})
                </p>
              )}

              {/* Extras */}
              {item.extras && item.extras.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Extras:</span>
                  <ul className="ml-4 list-disc">
                    {item.extras.map((extra, idx) => (
                      <li key={idx}>
                        {extra.name} (+${extra.price.toFixed(2)})
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
                  ${calculateItemTotal(item).toFixed(2)}
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
