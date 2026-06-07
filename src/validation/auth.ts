/**
 * Authentication Validation Schemas
 *
 * Provides Zod schemas for login and sign-up form validation.
 * Schemas are factory functions that accept a Translations object so that
 * all error messages are fully localised for the current user's locale.
 */
import { Translations } from "@/types/translations";
import * as z from "zod";

/**
 * Zod schema for the login form.
 * Validates email format and password length requirements.
 *
 * @param {Translations} translation - Localised validation messages.
 */
export const loginSchema = (translation: Translations) => {
  return z.object({
    email: z.email({ message: translation.validation.validEmail }).trim(),
    password: z
      .string()
      .min(8, { message: translation.validation.passwordMinLength })
      .max(64, { message: translation.validation.passwordMaxLength }),
  });
};

/**
 * Shared create-user schema for both client and server usage.
 * Keep this as the canonical shape for registration payload validation.
 */
export const CreateUserSchema = (translation: Translations) => {
  return z
    .object({
      name: z
        .string()
        .min(1, { message: translation.validation.nameRequired })
        .trim(),
      email: z.email({ message: translation.validation.validEmail }).trim(),
      password: z
        .string()
        .min(8, { message: translation.validation.passwordMinLength })
        .max(64, { message: translation.validation.passwordMaxLength }),
      confirmPassword: z
        .string()
        .min(1, { message: translation.validation.confirmPasswordRequired }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: translation.validation.passwordMismatch,
      path: ["confirmPassword"],
    });
};

/**
 * Backward-compatible alias used by existing signup flow.
 */
export const signupSchema = CreateUserSchema;

export type CreateUserInput = z.infer<ReturnType<typeof CreateUserSchema>>;

export type ValidationErrors =
  | {
      [key: string]: string | string[] | undefined;
    }
  | undefined;
