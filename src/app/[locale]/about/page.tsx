import { useTranslations } from "next-intl";

/**
 * About page component.
 */
export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="min-h-screen py-12 md:py-16 page-surface">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center rounded-3xl border border-border/70 bg-white/80 backdrop-blur p-8 md:p-10 shadow-sm">
            <h1 className="text-4xl md:text-5xl font-semibold text-primary mb-4">
              {t("title")}
            </h1>
            <h2 className="text-xl md:text-2xl font-medium mb-4">
              {t("headline")}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-4">
              {t("description1")}
            </p>
            <p className="text-base md:text-lg text-muted-foreground">
              {t("description2")}
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-border/70 bg-linear-to-br from-white to-slate-50 shadow-sm">
            <h3 className="text-2xl font-semibold mb-4 text-primary">
              {t("ourMission")}
            </h3>
            <p className="text-lg text-muted-foreground">{t("missionText")}</p>
          </div>

          <div className="rounded-3xl border border-border/70 bg-white/85 p-8 shadow-sm">
            <h3 className="text-2xl font-semibold mb-6 text-primary">
              {t("ourValues")}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <h4 className="text-xl font-semibold mb-2 text-primary">
                  {t("quality")}
                </h4>
                <p className="text-muted-foreground">{t("qualityDesc")}</p>
              </div>
              <div className="text-center p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <h4 className="text-xl font-semibold mb-2 text-primary">
                  {t("authentic")}
                </h4>
                <p className="text-muted-foreground">{t("authenticDesc")}</p>
              </div>
              <div className="text-center p-6 bg-primary/5 rounded-2xl border border-primary/20">
                <h4 className="text-xl font-semibold mb-2 text-primary">
                  {t("service")}
                </h4>
                <p className="text-muted-foreground">{t("serviceDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
