import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import type { Locale } from "@/i18n/routing";
import { isOwner } from "@/lib/dashboard/auth";
import { getStaffMembers } from "@/lib/dashboard/queries";
import { CreateStaffForm } from "@/components/dashboard/create-staff-form";
import { StaffList } from "@/components/dashboard/staff-list";
import { OwnerOnlyMessage } from "@/components/dashboard/owner-only-message";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function StaffPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("dashboard.staff");

  const session = await auth();
  if (!session?.user?.role || !isOwner(session.user.role)) {
    return <OwnerOnlyMessage />;
  }

  let staff: Awaited<ReturnType<typeof getStaffMembers>> = [];
  if (session.user.tenantId) {
    try {
      staff = await getStaffMembers(session.user.tenantId);
    } catch {
      staff = [];
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("pageTitle")}</h1>
        <p className="mt-2 text-zinc-600">{t("pageDesc")}</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
        <CreateStaffForm />
        <StaffList staff={staff} />
      </div>
    </div>
  );
}
