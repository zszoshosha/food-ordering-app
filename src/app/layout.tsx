import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/redux/provider";
import { Sonner } from "@/components/ui/sonner";

/**
 * Roboto font configuration for the application.
 */
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  preload: true,
});

/**
 * Metadata for the application.
 */
export const metadata: Metadata = {
  title: "Pizza Palace - Delicious Pizza Delivery",
  description:
    "Order authentic Italian pizzas and delicious food online. Fast delivery with fresh quality ingredients.",
};

/**
 * RootLayout component wraps the entire application.
 *
 * Note: Header and Footer have been moved to the [locale] layout
 * so they can access the current locale for translations and RTL support.
 * This root layout only provides the HTML shell, fonts, and Redux store.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={roboto.className}>
        {/* ReduxProvider wraps everything to enable global state (cart, etc.) */}
        <ReduxProvider>
          {children}
          <Sonner />
        </ReduxProvider>
      </body>
    </html>
  );
}
