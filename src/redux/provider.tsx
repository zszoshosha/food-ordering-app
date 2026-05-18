"use client";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import { store } from "./store";

/**
 * ReduxProvider wraps the application tree with the Redux store.
 * Must be rendered in a Client Component context.
 *
 * @param {React.ReactNode} children - The application subtree to provide the store to.
 */
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Provider store={store}>{children}</Provider>
    </SessionProvider>
  );
}
