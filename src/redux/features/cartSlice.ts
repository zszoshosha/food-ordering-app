import { Extra, Size } from "@prisma/client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

/**
 * Cart Item Type Definition
 * Represents a single product in the shopping cart with all its customizations
 */
export type cartItem = {
  name: string; // Product name
  id: string; // Product ID
  image: string; // Product image URL
  basePrice: number; // Base price of the product
  quantity?: number; // Quantity of this item in cart (default: 1)
  size?: Size; // Optional selected size with price modifier
  extras?: Extra[]; // Optional selected extras/toppings
};

/**
 * Cart State Type
 * Manages the collection of cart items
 */
type cartState = {
  items: cartItem[];
};
/**
 * Initial state - starts with empty cart
 * Note: localStorage is synced from CartItems component on client-side only
 * This avoids hydration issues in Next.js SSR
 */
const initialState: cartState = {
  items: [],
};

/**
 * Generate a unique key for a cart item based on its id, size, and extras
 * This ensures duplicate items with different customizations are treated as separate items
 * @param item - The cart item to generate a key for
 * @returns A unique string key combining product id + size + extras
 */
const getCartItemKey = (item: cartItem) => {
  const sizeId = item.size?.id ?? "no-size";
  const extrasKey =
    item.extras
      ?.map((e) => e.id)
      .sort()
      .join("|") ?? "no-extras";
  return `${item.id}-${sizeId}-${extrasKey}`;
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /**
     * Add item to cart or increment quantity if item with same customization exists
     * Checks if the exact item (product + size + extras) already exists
     * If yes: increments quantity by 1
     * If no: adds new item with quantity 1
     */
    addCartItem: (state, action: PayloadAction<cartItem>) => {
      const incomingKey = getCartItemKey(action.payload);
      const existingItem = state.items.find(
        (item) => getCartItemKey(item) === incomingKey,
      );
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 0) + 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity ?? 1,
        });
      }
    },
    /**
     * Decrease quantity of item by 1
     * If quantity reaches 0 or below, removes the item from cart
     */
    removeCartItem: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item && item.quantity && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        state.items = state.items.filter(
          (item) => item.id !== action.payload.id,
        );
      }
    },
    removeItemFromCart: (state, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },
    /**
     * Hydrate cart from localStorage on client-side.
     * This action replaces the entire cart state with persisted items.
     * Called once on mount in CartItems component to restore the cart
     * after SSR hydration (avoids mismatch between server and client state).
     */
    hydrateCart: (state, action: PayloadAction<cartItem[]>) => {
      state.items = action.payload;
    },
    clearCart: (state) => {
      state.items = [];
    },
    incrementQuantity: (state, action: PayloadAction<{ id: string }>) => {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (item) {
        item.quantity! += 1;
      }
    },
  },
});

export const {
  addCartItem,
  removeCartItem,
  removeItemFromCart,
  hydrateCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;
