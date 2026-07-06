"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SearchBarProps = {
  placeholder?: string;
  ariaLabel?: string;
};

const SearchBar = ({
  placeholder = "Search...",
  ariaLabel = "Search products",
}: SearchBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const [value, setValue] = useState(currentSearch);

  useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  const updateSearchParam = useMemo(
    () => (nextValue: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmedValue = nextValue.trim();

      if (trimmedValue) {
        params.set("search", trimmedValue);
      } else {
        params.delete("search");
      }

      params.delete("page");

      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearchParam(value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="menu-search" className="sr-only">
        {ariaLabel}
      </label>
      <div className="relative">
        <input
          id="menu-search"
          type="search"
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            setValue(nextValue);
            updateSearchParam(nextValue);
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className="w-full rounded-xl border border-border bg-white/80 px-4 py-3 pr-12 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-2 my-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label={ariaLabel}
        >
          <span aria-hidden="true">⌕</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
