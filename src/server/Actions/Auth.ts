"use server";

import { Locale } from "@/i18n/request";
import { db } from "@/lib/prisma";
import getTrans from "@/lib/translation";
import { loginSchema } from "@/valdition/auth";
import bcrypt from "bcryptjs";
import * as z from "zod";

export const login = async (
  credentials: Record<"email" | "password", string> | undefined,
  locale: Locale,
) => {
  const translations = await getTrans(locale);
  // Validate credentials with locale-specific zod messages.
  const result = loginSchema(translations).safeParse(credentials);
  if (!result.success) {
    const errors = z.flattenError(result.error).fieldErrors;
    return { status: "400", errors };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: result.data.email },
    });
    if (!user) {
      return {
        status: "400",
        errors: { email: translations.validation.validEmail },
      };
    }
    // Compare submitted password against the stored bcrypt hash.
    const hashedPassword = user.password;
    const isPasswordValid = await bcrypt.compare(
      result.data.password,
      hashedPassword,
    );
    if (!isPasswordValid) {
      return {
        status: "400",
        errors: { password: translations.validation.passwordMismatch },
      };
    }
    return {
      status: "200",
      errors: undefined,
      user,
      message: translations.messages.loginSuccessful,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      status: "500",
      errors: { general: "An unexpected error occurred. Please try again." },
    };
  }
};
