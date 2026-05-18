import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";

/**
 * Redux store configuration.
 * Enables Redux DevTools in non-production environments.
 */
export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

/** Inferred dispatch type from the store. */
export type AppDispatch = typeof store.dispatch;
/** Inferred root state type from all reducers. */
export type RootState = ReturnType<typeof store.getState>;
