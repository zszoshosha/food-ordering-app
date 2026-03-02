import Bestsellers from "./_components/Bestsellers";
import Hero from "./_components/Hero";
import About from "./_components/About";
import Contact from "./_components/Contact";

/**
 * Home page component.
 * Renders the main landing page with Hero, Bestsellers, About, and Contact sections.
 */
export default function Home() {
  return (
    <main>
      <Hero />
      <Bestsellers />
      <About />
      <Contact />
    </main>
  );
}
