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
import { Environments } from "@/constants/enums";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { withPrismaRetry } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  AUTH_ROLES,
  mapDatabaseRoleToAuthRole,
} from "@/lib/auth/roles";

export const authOptions: NextAuthOptions = {
  // Keep this stable across deploys so JWT/session verification remains valid.
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === Environments.DEV,
  session: {
    strategy: "jwt",
    updateAge: 24 * 60 * 60, // 24 hours
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = mapDatabaseRoleToAuthRole(
          (user as { role?: string }).role,
        );
      }

      if (!token.role) {
        token.role = AUTH_ROLES.GUEST;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }

      if (token.name) {
        session.user.name = token.name;
      }

      if (token.email) {
        session.user.email = token.email;
      }

      session.user.role =
        (token.role as (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES] | undefined) ??
        AUTH_ROLES.GUEST;

      return session;
    },
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: {
          label: "Email or Username",
          type: "text",
          placeholder: "Enter email or username",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
      },
      authorize: async (credentials) => {
        const identifier =
          credentials?.identifier ||
          (credentials as { email?: string | null } | null)?.email ||
          "";
        const password = credentials?.password || "";

        if (!identifier || !password) {
          return null;
        }

        const user = await withPrismaRetry(() =>
          db.user.findFirst({
            where: {
              OR: [
                { email: identifier },
                { name: identifier },
              ],
            },
          }),
        );

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    // Add your authentication providers here
  ],
  adapter: PrismaAdapter(db),
};
