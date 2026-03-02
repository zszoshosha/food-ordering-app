/**
 * NextAuth Configuration
 *
 * Sets up authentication using NextAuth.js with credentials-based login.
 * Uses JWT strategy for session management and PrismaAdapter for database integration.
 *
 * Current setup:
 * - Credentials provider for email/password authentication
 * - JWT sessions with 7-day max age and 24-hour update interval
 * - Custom sign-in and sign-out page routes
 */
import { Environments, Pages, Routes } from "@/constants/enums";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || crypto.randomUUID(),
  debug: process.env.NODE_ENV === Environments.DEV,
  session: {
    strategy: "jwt",
    updateAge: 24 * 60 * 60, // 24 hours
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: `/${Routes.AUTH}/${Pages.LOGIN}`,
    signOut: `/${Routes.AUTH}/${Pages.Register}`,
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        return {
          id: crypto.randomUUID(),
          email: credentials.email || "",
        };
      },
    }),
    // Add your authentication providers here
  ],
  adapter: PrismaAdapter(db),
};
