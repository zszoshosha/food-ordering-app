"use client";

/**
 * Language Switcher Component
 *
 * A dropdown component that allows users to switch between supported languages.
 * It reads the current locale from the URL params and swaps it when a new
 * language is selected, preserving the rest of the current path.
 *
 * Supported languages: English, Arabic (العربية)
 */
import { useParams, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// List of supported languages with display names and flag emojis
const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

export default function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract the current locale from URL params (e.g., "en" from /en/menu)
  const currentLocale = params.locale as string;
  // Determine if current language is Arabic for RTL dropdown positioning
  const isArabic = currentLocale === "ar";

  /**
   * Handles switching to a new language.
   * Replaces the locale segment in the URL (e.g., /en/menu → /ar/menu)
   * and navigates to the new path.
   */
  const handleLanguageChange = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLanguage =
    languages.find((lang) => lang.code === currentLocale) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5" />
        <span className="hidden sm:inline">
          {currentLanguage.flag} {currentLanguage.name}
        </span>
        <span className="sm:hidden">{currentLanguage.flag}</span>
      </button>

      {isOpen && (
        <div
          className={`absolute ${isArabic ? "left-0" : "right-0"} mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50`}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors ${
                language.code === currentLocale
                  ? "bg-gray-50 font-semibold"
                  : ""
              }`}
            >
              <span className="text-xl">{language.flag}</span>
              <span>{language.name}</span>
              {language.code === currentLocale && (
                <span className="ms-auto text-green-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
