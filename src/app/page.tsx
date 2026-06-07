import Bestsellers from "./_components/Bestsellers";
import Hero from "./_components/Hero";
import About from "./_components/About";
import Contact from "./_components/Contact";

type PostalAddressSchema = {
  "@type": "PostalAddress";
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: string;
};

type OpeningHoursSpecificationSchema = {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
};

type RestaurantSchema = {
  "@context": "https://schema.org";
  "@type": "Restaurant";
  name: string;
  image: string[];
  address: PostalAddressSchema;
  priceRange: string;
  openingHoursSpecification: OpeningHoursSpecificationSchema[];
};

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://yourdomain.com";

const restaurantJsonLd: RestaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Pizza Palace",
  image: [SITE_URL + "/assets/images/pizza.png"],
  address: {
    "@type": "PostalAddress",
    streetAddress: "123 Main Street",
    addressLocality: "Cairo",
    addressRegion: "Cairo Governorate",
    postalCode: "11511",
    addressCountry: "EG",
  },
  priceRange: "EGP 80 - EGP 500",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "10:00",
      closes: "23:00",
    },
  ],
};

const toJsonLdString = (value: unknown) =>
  JSON.stringify(value).replace(/</g, "\\u003c");

/**
 * Home page component.
 * Renders the main landing page with Hero, Bestsellers, About, and Contact sections.
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdString(restaurantJsonLd) }}
      />

      <main>
        <Hero />
        <Bestsellers />
        <About />
        <Contact />
      </main>
    </>
  );
}
