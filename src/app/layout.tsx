import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/redux/provider";
import { Sonner } from "@/components/ui/sonner";

/**
 * Body font configuration for the application.
 */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  preload: true,
});

/**
 * Display font configuration used by headings and hero text.
 */
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
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
      <body
        className={`${manrope.variable} ${playfairDisplay.variable} ${manrope.className}`}
      >
        {/* ReduxProvider wraps everything to enable global state (cart, etc.) */}
        <ReduxProvider>
          {children}
          <Sonner />
        </ReduxProvider>
      </body>
    </html>
  );
}
