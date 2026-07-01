import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("home");

  const features = [
    {
      title: t("features.bookings"),
      description: t("features.bookingsDesc"),
    },
    {
      title: t("features.staff"),
      description: t("features.staffDesc"),
    },
    {
      title: t("features.website"),
      description: t("features.websiteDesc"),
    },
  ];

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-zinc-500">
          SaaS për berberi
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
          {t("subtitle")}
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            {t("cta")}
          </Link>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title}>
              <h2 className="text-base font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
