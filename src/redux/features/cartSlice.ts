import { Extra, Size } from "@prisma/client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type cartItem = {
  name: string;
  id: string;
  image: string;
  basePrice: number;
  quantity?: number;
  size?: Size;
  extras?: Extra[];
};

type cartState = {
  items: cartItem[];
};

const initialState: cartState = {
  items: [],
};

// Create a stable key for a cart item based on id + size + extras
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
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addCartItem, removeCartItem, removeItemFromCart, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state: RootState) => state.cart.items;
