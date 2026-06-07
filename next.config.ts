import type { NextConfig } from "next";
// Import the next-intl plugin to enable internationalization (i18n) support
import createNextIntlPlugin from "next-intl/plugin";

// Initialize the next-intl plugin, pointing to our i18n configuration file
// This wraps the Next.js config to enable locale-based routing and message loading
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Allow optimized image delivery from Cloudinary and legacy seeded URLs.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
    ],
  },
};

// Wrap the config with next-intl to inject i18n proxy routing
export default withNextIntl(nextConfig);
