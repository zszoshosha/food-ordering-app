"use client";

import {
  CartAction,
  RootState,
  dispatchCartAction,
  useCartStore,
} from "./features/cartSlice";

export const useAppDispatch = () => {
  return (action: CartAction) => {
    dispatchCartAction(action);
  };
};

export const useAppSelector = <TSelected>(
  selector: (state: RootState) => TSelected,
): TSelected => {
  return useCartStore((state) => selector({ cart: { items: state.items } }));
};
