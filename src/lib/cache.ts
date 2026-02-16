import { unstable_cache as nextCache, unstable_cache } from "next/cache";
import { cache as reactCache } from "react";

type Callback = (...args: any[]) => Promise<any>;

export function Cache<T extends Callback>(
  cb: T,
  KeyParts?: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  }
): T {
  return nextCache(reactCache(cb), KeyParts, options);
}
