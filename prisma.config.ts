import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * `prisma generate` never connects to the database. On Vercel, `postinstall`
 * can run before env vars are available, so we must not throw when they are missing.
 */
const GENERATE_PLACEHOLDER_URL =
  "postgresql://prisma:prisma@127.0.0.1:5432/prisma?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? GENERATE_PLACEHOLDER_URL,
  },
});
