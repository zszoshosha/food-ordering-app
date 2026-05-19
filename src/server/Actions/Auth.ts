"use server";

import { Locale } from "@/i18n/request";
import { getCurrentLocale } from "@/lib/getCurrentLocale";
import { db, withPrismaRetry } from "@/lib/prisma";
import getTrans from "@/lib/translation";
import { loginSchema, signupSchema } from "@/validation/auth";
import bcrypt from "bcryptjs";
import * as z from "zod";

export type SignupState = {
  status?: number;
  message?: string;
  errors: Record<string, string | string[] | undefined>;
  formdata?: FormData;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: "USER" | "ADMIN" | "DELIVERY";
  };
};

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
    const user = await withPrismaRetry(() =>
      db.user.findUnique({
        where: { email: result.data.email },
      }),
    );
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
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

export const signup = async (
  _prevstate: SignupState,
  formdata: FormData,
): Promise<SignupState> => {
  const locale = await getCurrentLocale();
  const translations = await getTrans(locale);
  const result = signupSchema(translations).safeParse(
    Object.fromEntries(formdata.entries()),
  );
  if (!result.success) {
    return {
      errors: z.flattenError(result.error).fieldErrors,
      formdata,
    };
  }
  try {
    const existingUser = await withPrismaRetry(() =>
      db.user.findUnique({
        where: { email: result.data.email },
      }),
    );
    if (existingUser) {
      return {
        status: 409,
        message: translations.messages.userAlreadyExists,
        errors: {},
        formdata,
      };
    }
    const hashedPassword = await bcrypt.hash(result.data.password, 10);
    const createdUser = await db.user.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        password: hashedPassword,
      },
    });
    return {
      status: 201,
      message: translations.messages.accountCreated,
      errors: {},
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      status: 500,
      errors: { general: "An unexpected error occurred. Please try again." },
      formdata,
    };
  }
};
