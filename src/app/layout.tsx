import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ReduxProvider } from "@/redux/provider";

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
 * Includes the header and applies global styles and fonts.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to render.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ReduxProvider>
          <Header />
          {children}
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
