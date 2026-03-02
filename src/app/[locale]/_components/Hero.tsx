import { useLocale, useTranslations } from "next-intl";
import Link from "@/components/link";
import { buttonVariants } from "@/components/ui/button";
import { Routes } from "@/constants/enums";
import { ArrowRightCircle } from "lucide-react";
import Image from "next/image";

/**
 * Hero component for the homepage.
 * Displays a prominent section with a heading, description, call-to-action buttons, and an image.
 * Responsive design with grid layout for text and image.
 */
const Hero = () => {
  const t = useTranslations("hero");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <section className="section-gap">
      <div
        className="
      container grid grid-cols-1 md:grid-cols-2"
      >
        <div className="md:py-12 flex flex-col justify-center text-start">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {t("description")}
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link
              href={`/${Routes.MENU}`}
              className={`${buttonVariants({
                size: "lg",
              })} inline-flex items-center gap-2 !px-4 rounded-full uppercase`}
            >
              {t("orderNow")}{" "}
              <ArrowRightCircle
                className={`${isArabic ? "rotate-180" : ""} !w-5 !h-5`}
              />
            </Link>
            <Link
              href={`/${Routes.MENU}`}
              className="flex gap-2 items-center text-foreground hover:text-primary duration-200 transition-colors font-semibold"
            >
              {t("viewMenu")}{" "}
              <ArrowRightCircle
                className={`${isArabic ? "rotate-180" : ""} !w-5 !h-5`}
              />{" "}
            </Link>
          </div>
        </div>
        <div className="relative h-64 md:h-96 lg:h-[500px] flex items-center justify-center">
          <Image
            src="/assets/images/pizza.png"
            alt="pizza photo"
            fill
            priority
            className="object-contain drop-shadow-lg"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
