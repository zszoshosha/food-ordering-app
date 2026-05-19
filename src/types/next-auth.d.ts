import { DefaultSession } from "next-auth";

type AppRole = "USER" | "ADMIN" | "DELIVERY";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role: AppRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: AppRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    role?: AppRole;
  }
}
