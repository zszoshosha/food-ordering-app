import Link from "@/components/link";
import { buttonVariants } from "@/components/ui/button";
import { Routes } from "@/constants/enums";
import { ArrowRightCircle } from "lucide-react";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="section-gap">
      <div
        className="
      container grid grid-cols-1 md:grid-cols-2"
      >
        <div className="md:py-12">
          <h1>slice into happiness</h1>
          <p>
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
              className="flex gap-2 items-center text-black hover:text-primary duration-200 transition-colors font-semibold"
            >
              learn more <ArrowRightCircle className="!w-5 !h-5" />{" "}
            </Link>
          </div>
        </div>
        <div className="relative">
          <Image
            src="/assets/images/pizza.png"
            alt="pizza photo"
            fill
            priority
            className="object-contain"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
