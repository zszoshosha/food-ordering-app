import { CartItem } from "@/redux/features/cartSlice";

/**
 * Calculates the total number of items in the cart.
 * @param {CartItem[]} cart - The array of cart items.
 * @returns {number} Sum of all item quantities.
 */
export const getCartQuantity = (cart: CartItem[]): number => {
  return cart.reduce(
    (total: number, item: CartItem) => total + (item.quantity || 1),
    0,
  );
};

/**
 * Returns the current quantity of a specific item in the cart by its ID.
 * @param {string} id - The product ID to look up.
 * @param {CartItem[]} cart - The array of cart items.
 * @returns {number} The quantity of the item, or 0 if not in cart.
 */
export const getCartItemQuantity = (id: string, cart: CartItem[]) => {
  return cart.find((item) => item.id === id)?.quantity || 0;
};

/**
 * Calculates the unit price for a single cart item including size and extras.
 * @param {CartItem} item - The cart item.
 * @returns {number} Unit price (base + size modifier + extras).
 */
export const getCartItemUnitPrice = (item: CartItem) => {
  const extrasTotal =
    item.extras?.reduce((sum, extra) => sum + Number(extra.price), 0) || 0;
  const base = Number(item.basePrice || 0);
  const sizePrice = Number(item.size?.price || 0);
  return base + sizePrice + extrasTotal;
};

/**
 * Calculates the total price for a single cart item (unit price × quantity).
 * @param {CartItem} item - The cart item.
 * @returns {number} Total price for this line item.
 */
export const getCartItemTotal = (item: CartItem) => {
  const qty = Number(item.quantity || 1);
  return getCartItemUnitPrice(item) * qty;
};

/**
 * Calculates the grand total of all items in the cart.
 * @param {CartItem[]} cart - The array of cart items.
 * @returns {number} Sum of all line item totals.
 */
export const getTotal = (cart: CartItem[]) => {
  return cart.reduce((total, item) => total + getCartItemTotal(item), 0);
};
