import { db } from "@/lib/prisma";
import Bestsellers from "./_components/Bestsellers";
import Hero from "./_components/Hero";

/**
 * Home page component.
 * Renders the main landing page with Hero and Bestsellers sections.
 */
export default async function Home() {
  const product = await db.product.findMany();
  console.log(product);
  return (
    <main>
      <Hero />
      <Bestsellers />
    </main>
  );
}
