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
  return (
    <section className="section-gap">
      <div
        className="
      container grid grid-cols-1 md:grid-cols-2"
      >
        <div className="md:py-12 flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-4">slice into happiness</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Ipsam
            incidunt commodi magni reprehenderit quo officiis fuga obcaecati
            possimus ad, laudantium esse eos consequuntur nulla deleniti
            accusamus. Laboriosam assumenda cupiditate excepturi?
          </p>
          <div className="flex gap-4 items-center">
            <Link
              href={`/${Routes.MENU}`}
              className={`${buttonVariants({
                size: "lg",
              })}space-x-2 !px-4 rounded-full uppercase`}
            >
              Order now <ArrowRightCircle className="!w-5 !h-5" />
            </Link>
            <Link
              href={`/${Routes.MENU}`}
              className="flex gap-2 items-center text-foreground hover:text-primary duration-200 transition-colors font-semibold"
            >
              learn more <ArrowRightCircle className="!w-5 !h-5" />{" "}
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
