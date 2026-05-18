"use client";
import CartItems from "./_components/CartItems";
import CheckOut from "./_components/CheckOut";

/**
 * Cart page that shows cart items alongside the order summary.
 */
const CartPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartItems />
        </div>
        <div className="lg:col-span-1">
          <CheckOut />
        </div>
      </div>
    </div>
  );
};

export default CartPage;
