import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge and conditionally apply CSS classes.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 * @param {...ClassValue} inputs - Class values to merge.
 * @returns {string} The merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts text into a URL-safe slug while preserving English and Arabic letters.
 */
export function slugify(text: string): string {
  const normalized = text
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .toLowerCase()
    .trim()

  const cleaned = normalized.replace(
    /[^a-z0-9\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s-]/g,
    "",
  )

  return cleaned
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}
