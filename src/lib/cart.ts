import { cartItem } from "@/redux/features/cartSlice";

export const getCartQuantity = (cart: cartItem[]): number => {
  return cart.reduce(
    (total: number, item: cartItem) => total + (item.quantity || 1),
    0,
  );
};

export const getCartTotal = (id: string, cart: cartItem[]) => {
  return cart.find((item) => item.id === id)?.quantity || 0;
};

export const getCartItemUnitPrice = (item: cartItem) => {
  const extrasTotal =
    item.extras?.reduce((sum, extra) => sum + Number(extra.price), 0) || 0;
  const base = Number(item.basePrice || 0);
  const sizePrice = Number(item.size?.price || 0);
  return base + sizePrice + extrasTotal;
};

export const getCartItemTotal = (item: cartItem) => {
  const qty = Number(item.quantity || 1);
  return getCartItemUnitPrice(item) * qty;
};

export const getTotal = (cart: cartItem[]) => {
  return cart.reduce((total, item) => total + getCartItemTotal(item), 0);
};
