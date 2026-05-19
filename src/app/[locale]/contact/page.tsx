import { useTranslations } from "next-intl";

/**
 * Contact page component.
 */
export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <main className="min-h-screen py-12 md:py-16 page-surface">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 rounded-3xl border border-border/70 bg-white/80 backdrop-blur p-8 shadow-sm">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-primary">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div className="rounded-3xl border border-border/70 bg-white/85 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6 text-primary">
              {t("getInTouch")}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t("address")}</h3>
                <p className="text-muted-foreground">{t("address")}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("phone")}</h3>
                <p className="text-muted-foreground">{t("phone")}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("email")}</h3>
                <p className="text-muted-foreground">{t("emailAddress")}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("hours")}</h3>
                <p className="text-muted-foreground">{t("weekdays")}</p>
                <p className="text-muted-foreground">{t("weekends")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-white/85 p-8 shadow-sm">
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-2 font-medium">
                  {t("name")}
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder={t("name")}
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 font-medium">
                  {t("email")}
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder={t("email")}
                />
              </div>
              <div>
                <label htmlFor="subject" className="block mb-2 font-medium">
                  {t("subject")}
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder={t("subject")}
                />
              </div>
              <div>
                <label htmlFor="message" className="block mb-2 font-medium">
                  {t("message")}
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full px-4 py-3 border border-border rounded-xl bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  placeholder={t("message")}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-3 rounded-full font-semibold hover:opacity-90 transition"
              >
                {t("send")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
