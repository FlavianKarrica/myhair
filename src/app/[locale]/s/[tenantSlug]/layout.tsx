import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Locale } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; tenantSlug: string }>;
};

export default async function ShopLayout({ children, params }: Props) {
  const { locale, tenantSlug } = await params;
  setRequestLocale(locale as Locale);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href={`/s/${tenantSlug}`}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            ← {tenantSlug}
          </Link>
          <LocaleSwitcher />
        </div>
      </header>
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, tenantSlug } = await params;
  const { getPublicTenantBySlug } = await import("@/lib/public/tenant");
  const tenant = await getPublicTenantBySlug(tenantSlug).catch(() => null);

  return {
    title: tenant?.name ?? tenantSlug,
    description: tenant?.description ?? undefined,
  };
}
