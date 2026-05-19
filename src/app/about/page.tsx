import React from "react";
import MainHeading from "@/components/main-heading";

/**
 * About page component.
 * Displays information about the food ordering application.
 */
export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col page-surface">
      <div className="container py-12 md:py-16 flex-1">
        <div className="mb-10">
          <MainHeading title="About Us" subTitle="Learn more" />
        </div>

        <div className="rounded-3xl p-8 md:p-12 border border-border/70 bg-white/80 backdrop-blur shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  Our Story
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Pizza Palace, your destination for authentic
                  Italian pizzas and comforting dishes made with care. Founded
                  in 2020, we have served our community with quality ingredients
                  and warm hospitality.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  Our Mission
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our mission is simple: make memorable meals with fresh
                  ingredients and deliver them quickly, so every order feels
                  like a special moment.
                </p>
              </section>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  Why Choose Us?
                </h2>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                    100% fresh quality ingredients
                  </li>
                  <li className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                    Fast and reliable delivery
                  </li>
                  <li className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                    Flexible customization for every pizza
                  </li>
                  <li className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                    Friendly, professional kitchen and support team
                  </li>
                </ul>
              </section>

              <section className="rounded-2xl bg-slate-900 text-slate-100 p-6">
                <h2 className="text-2xl font-semibold mb-4">Contact Info</h2>
                <div className="space-y-2 text-sm md:text-base text-slate-300">
                  <p>
                    <strong className="text-white">Phone:</strong> +1 (555)
                    123-4567
                  </p>
                  <p>
                    <strong className="text-white">Email:</strong>
                    info@pizzapalace.com
                  </p>
                  <p>
                    <strong className="text-white">Address:</strong> 123 Main
                    Street, Food City, FC 12345
                  </p>
                  <p>
                    <strong className="text-white">Hours:</strong> Mon - Sun,
                    11:00 AM - 11:00 PM
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
