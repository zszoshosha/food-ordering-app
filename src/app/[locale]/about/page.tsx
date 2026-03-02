import { useTranslations } from "next-intl";

/**
 * About page component.
 */
export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">{t("title")}</h1>
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-semibold mb-4">{t("headline")}</h2>
            <p className="text-lg text-gray-700 mb-4">{t("description1")}</p>
            <p className="text-lg text-gray-700">{t("description2")}</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">{t("ourMission")}</h3>
            <p className="text-lg text-gray-700">{t("missionText")}</p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold mb-6">{t("ourValues")}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-2">{t("quality")}</h4>
                <p className="text-gray-600">{t("qualityDesc")}</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-2">{t("authentic")}</h4>
                <p className="text-gray-600">{t("authenticDesc")}</p>
              </div>
              <div className="text-center p-6 bg-white rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-2">{t("service")}</h4>
                <p className="text-gray-600">{t("serviceDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
