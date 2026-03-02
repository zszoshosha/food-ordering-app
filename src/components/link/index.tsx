"use client";

/**
 * Custom Link Component (Locale-Aware)
 *
 * Wraps Next.js Link to automatically prepend the current locale to all hrefs.
 * This ensures all internal navigation stays within the correct locale context
 * (e.g., href="/menu" becomes "/en/menu" or "/ar/menu" based on current locale).
 *
 * Also implements on-hover prefetching for improved page load performance.
 */
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import React, { FC, HTMLAttributes, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type CustomLinkProps = NextLinkProps & {
  children: React.ReactNode;
  href: string;
  target?: string;
} & HTMLAttributes<HTMLAnchorElement>;

const Link: FC<CustomLinkProps> = ({ children, href, ...rest }) => {
  const [prefetching, setPrefetching] = useState(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const params = useParams();
  // Read the current locale from URL params to prefix all links
  const locale = params.locale as string;

  const setPrefetchListener = () => {
    setPrefetching(true);
  };
  const removePrefetchListener = () => {
    setPrefetching(false);
  };

  useEffect(() => {
    const linkElement = linkRef.current;
    linkElement?.addEventListener("mouseover", setPrefetchListener);
    linkElement?.addEventListener("mouseleave", removePrefetchListener);
    return () => {
      linkElement?.removeEventListener("mouseover", setPrefetchListener);
      linkElement?.removeEventListener("mouseleave", removePrefetchListener);
    };
  }, [prefetching]);

  /**
   * Automatically prepend the locale prefix to the href.
   * - If href doesn't start with "/", add "/{locale}/" prefix (e.g., "menu" → "/en/menu")
   * - If href starts with "/" but doesn't include the locale, prepend "/{locale}" (e.g., "/menu" → "/en/menu")
   * - If href already contains the locale, use it as-is
   */
  const hrefWithLocale =
    typeof href === "string" && !href.startsWith("/")
      ? `/${locale}/${href}`
      : typeof href === "string" && !href.includes(`/${locale}/`)
        ? `/${locale}${href}`
        : href;

  return (
    <NextLink
      href={hrefWithLocale}
      ref={linkRef}
      prefetch={prefetching}
      {...rest}
    >
      {children}
    </NextLink>
  );
};

export default Link;
