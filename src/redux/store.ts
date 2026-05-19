import { CartAction, RootState } from "./features/cartSlice";

export type AppDispatch = (action: CartAction) => void;
export type { RootState };

export const store = {};
