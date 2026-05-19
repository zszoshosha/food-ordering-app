"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Session provider wrapper. Cart state is managed by Zustand.
 */
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
