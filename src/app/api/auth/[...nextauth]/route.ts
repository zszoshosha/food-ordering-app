/**
 * NextAuth API Route Handler
 *
 * This catch-all route handles all NextAuth.js authentication requests:
 * - GET: Session retrieval, CSRF token, sign-in/sign-out pages
 * - POST: Sign-in, sign-out, callback handling
 *
 * Configuration is imported from @/server/auth (authOptions)
 */
import { authOptions } from "@/server/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
