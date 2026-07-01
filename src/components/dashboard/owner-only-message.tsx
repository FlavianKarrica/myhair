import { getTranslations } from "next-intl/server";

export async function OwnerOnlyMessage() {
  const t = await getTranslations("dashboard.forbidden");

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
      {t("ownerOnly")}
    </div>
  );
}
