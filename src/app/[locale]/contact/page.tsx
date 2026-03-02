import { useTranslations } from "next-intl";

/**
 * Contact page component.
 */
export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-lg text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">{t("getInTouch")}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{t("address")}</h3>
                <p className="text-gray-600">{t("address")}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("phone")}</h3>
                <p className="text-gray-600">{t("phone")}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("email")}</h3>
                <p className="text-gray-600">{t("emailAddress")}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">{t("hours")}</h3>
                <p className="text-gray-600">{t("weekdays")}</p>
                <p className="text-gray-600">{t("weekends")}</p>
              </div>
            </div>
          </div>

          <div>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block mb-2 font-medium">
                  {t("name")}
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={t("message")}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
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
