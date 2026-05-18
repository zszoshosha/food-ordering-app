import { unstable_cache as nextCache } from "next/cache";
import { cache as reactCache } from "react";

type Callback = (...args: any[]) => Promise<any>;

/**
 * Combines React's `cache` (request-level deduplication) with Next.js
 * `unstable_cache` (cross-request persistent cache with optional TTL and tags).
 *
 * Use this wrapper for server-side data fetching functions that benefit from
 * both request-level and long-term caching.
 *
 * @param cb - The async function to cache.
 * @param KeyParts - Cache key segments for invalidation.
 * @param options - Optional revalidation TTL (seconds) and cache tags.
 */
export function Cache<T extends Callback>(
  cb: T,
  KeyParts?: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  },
): T {
  return nextCache(reactCache(cb), KeyParts, options);
}
