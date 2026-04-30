import { Translations } from "@/types/translations";
import * as z from "zod";

export const loginSchema = (translation: Translations) => {
  return z.object({
    email: z.email({ message: translation.validation.validEmail }).trim(),
    password: z
      .string()
      .min(8, { message: translation.validation.passwordMinLength })
      .max(64, { message: translation.validation.passwordMaxLength }),
  });
};

export const signupSchema = (translation: Translations) => {
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

export type ValidationErrors =
  | {
      [key: string]: string | string[] | undefined;
    }
  | undefined;
