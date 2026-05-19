import React from "react";

/**
 * MainHeading component displays a section title with a subtitle.
 * Used for headings in sections like "Our Best Sellers".
 * @param {string} title - The main title text.
 * @param {string} subTitle - The subtitle text.
 */
function MainHeading({ title, subTitle }: { title: string; subTitle: string }) {
  return (
    <div className="space-y-3 text-center">
      <span className="inline-block uppercase tracking-[0.22em] text-accent font-semibold leading-4 text-xs md:text-sm rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
        {subTitle}
      </span>
      <h2 className="font-display text-primary font-semibold text-3xl md:text-4xl lg:text-5xl leading-tight">
        {title}
      </h2>
    </div>
  );
}

export default MainHeading;
