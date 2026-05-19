import React from "react";
import MainHeading from "@/components/main-heading";
import { Button } from "@/components/ui/button";

/**
 * Contact page component.
 * Displays contact form and information.
 */
export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col page-surface">
      <div className="container py-12 md:py-16 flex-1">
        <div className="mb-10">
          <MainHeading title="Contact Us" subTitle="Get in touch" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          <div className="bg-white/85 backdrop-blur border border-border/70 shadow-sm rounded-3xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              Send us a Message
            </h2>
            <form className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background/70 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background/70 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background/70 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background/70 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                  placeholder="How can we help?"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background/70 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-none"
                  placeholder="Write your message here..."
                  required
                ></textarea>
              </div>

              <Button type="submit" size="lg" className="w-full rounded-full">
                Send Message
              </Button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-white/85 backdrop-blur border border-border/70 shadow-sm rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-6 text-primary">
                Get in Touch
              </h2>
              <p className="text-muted-foreground mb-6">
                Have questions or feedback? We'd love to hear from you! Reach
                out to us through any of the following channels:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground/80">
                      Mon - Sun, 11:00 AM - 11:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">
                      info@pizzapalace.com
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">📍</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Address</h3>
                    <p className="text-muted-foreground">123 Main Street</p>
                    <p className="text-muted-foreground">Food City, FC 12345</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Social Media
                    </h3>
                    <div className="flex gap-3 mt-2">
                      <a
                        href="#"
                        className="text-primary hover:text-primary/80 transition"
                      >
                        Facebook
                      </a>
                      <span className="text-gray-300">|</span>
                      <a
                        href="#"
                        className="text-primary hover:text-primary/80 transition"
                      >
                        Instagram
                      </a>
                      <span className="text-gray-300">|</span>
                      <a
                        href="#"
                        className="text-primary hover:text-primary/80 transition"
                      >
                        Twitter
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl h-64 flex items-center justify-center border border-slate-800">
              <p className="text-slate-300">Map Location</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
