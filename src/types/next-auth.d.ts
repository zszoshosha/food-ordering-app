import { DefaultSession } from "next-auth";
import type { AuthRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role: AuthRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: AuthRole | string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: AuthRole;
  }
}
