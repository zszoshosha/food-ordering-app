import { Translations } from "@/types/translations";
import * as z from "zod";

export const loginSchema = (translation: Translations) => {
  return z.object({
    email: z
      .email({ message: translation.validation.validEmail })
      .trim(),
    password: z
      .string()
      .min(8, { message: translation.validation.passwordMinLength })
      .max(64, { message: translation.validation.passwordMaxLength }),
  });
};
export type ValidationErrors =
  | {
      [key: string]: string;
    }
  | undefined;
