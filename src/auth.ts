import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { Session } from "next-auth";
import type { Account, Profile, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { AdapterUser } from "next-auth/adapters";
import { db } from "@/lib/db";
import { withPrismaRetry } from "@/lib/prisma";
import { env } from "@/lib/env";
import { AUTH_ROLES, mapDatabaseRoleToAuthRole } from "@/lib/auth/roles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: env.NEXTAUTH_SECRET,
  debug: env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    updateAge: 24 * 60 * 60,
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: AdapterUser | User;
      account?: Account | null;
      profile?: Profile;
      trigger?: "update" | "signIn" | "signUp";
      isNewUser?: boolean;
      session?: unknown;
    }) {
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
    async session({ session, token }: { session: Session; token: JWT }) {
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
        (token.role as
          | (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES]
          | undefined) ?? AUTH_ROLES.GUEST;

      return session;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allows relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      // Allows URLs on the same origin or hostname to support production custom domains and reverse proxies
      try {
        const parsedUrl = new URL(url);
        const parsedBaseUrl = new URL(baseUrl);
        if (
          parsedUrl.origin === parsedBaseUrl.origin ||
          parsedUrl.hostname === parsedBaseUrl.hostname
        ) {
          return url;
        }
      } catch {
        // Fallback
      }

      return baseUrl;
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
        const identifier = String(
          credentials?.identifier ||
            (credentials as { email?: string | null } | null)?.email ||
            "",
        );
        const password = String(credentials?.password || "");

        if (!identifier || !password) {
          return null;
        }

        const user = await withPrismaRetry(() =>
          db.user.findFirst({
            where: {
              OR: [{ email: identifier }, { name: identifier }],
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              password: true,
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
  ],
  adapter: PrismaAdapter(db),
});

export const { GET, POST } = handlers;
