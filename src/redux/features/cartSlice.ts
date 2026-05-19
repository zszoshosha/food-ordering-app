import { Extra, Size } from "@prisma/client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  name: string;
  id: string;
  image: string;
  basePrice: number;
  quantity?: number;
  size?: Size;
  extras?: Extra[];
};

type CartState = {
  items: CartItem[];
};

export type CartAction =
  | { type: "cart/addCartItem"; payload: CartItem }
  | { type: "cart/removeCartItem"; payload: { id: string } }
  | { type: "cart/removeItemFromCart"; payload: { id: string } }
  | { type: "cart/hydrateCart"; payload: CartItem[] }
  | { type: "cart/clearCart"; payload?: undefined }
  | { type: "cart/incrementQuantity"; payload: { id: string } };

type CartStore = CartState & {
  dispatch: (action: CartAction) => void;
};

const getCartItemKey = (item: CartItem) => {
  const sizeId = item.size?.id ?? "no-size";
  const extrasKey =
    item.extras
      ?.map((e) => e.id)
      .sort()
      .join("|") ?? "no-extras";

  return `${item.id}-${sizeId}-${extrasKey}`;
};

const applyCartAction = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "cart/addCartItem": {
      const incomingKey = getCartItemKey(action.payload);
      const existingItem = state.items.find(
        (item) => getCartItemKey(item) === incomingKey,
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            getCartItemKey(item) === incomingKey
              ? { ...item, quantity: (item.quantity || 0) + 1 }
              : item,
          ),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            quantity: action.payload.quantity ?? 1,
          },
        ],
      };
    }

    case "cart/removeCartItem": {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (item && item.quantity && item.quantity > 1) {
        return {
          ...state,
          items: state.items.map((entry) =>
            entry.id === action.payload.id
              ? { ...entry, quantity: (entry.quantity || 1) - 1 }
              : entry,
          ),
        };
      }

      return {
        ...state,
        items: state.items.filter((entry) => entry.id !== action.payload.id),
      };
    }

    case "cart/removeItemFromCart":
      return {
        ...state,
        items: state.items.filter((entry) => entry.id !== action.payload.id),
      };

    case "cart/hydrateCart":
      return {
        ...state,
        items: action.payload,
      };

    case "cart/clearCart":
      return {
        ...state,
        items: [],
      };

    case "cart/incrementQuantity":
      return {
        ...state,
        items: state.items.map((entry) =>
          entry.id === action.payload.id
            ? { ...entry, quantity: (entry.quantity || 0) + 1 }
            : entry,
        ),
      };

    default:
      return state;
  }
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      dispatch: (action) => set((state) => applyCartAction(state, action)),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export const dispatchCartAction = (action: CartAction) => {
  useCartStore.getState().dispatch(action);
};

export const addCartItem = (payload: CartItem): CartAction => ({
  type: "cart/addCartItem",
  payload,
});

export const removeCartItem = (payload: { id: string }): CartAction => ({
  type: "cart/removeCartItem",
  payload,
});

export const removeItemFromCart = (payload: { id: string }): CartAction => ({
  type: "cart/removeItemFromCart",
  payload,
});

export const hydrateCart = (payload: CartItem[]): CartAction => ({
  type: "cart/hydrateCart",
  payload,
});

export const clearCart = (): CartAction => ({
  type: "cart/clearCart",
});

export const incrementQuantity = (payload: { id: string }): CartAction => ({
  type: "cart/incrementQuantity",
  payload,
});

export type RootState = {
  cart: {
    items: CartItem[];
  };
};

export const selectCartItems = (state: RootState) => state.cart.items;
