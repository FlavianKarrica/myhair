import { requireAuth, redirectTo } from "@/lib/redirect";
import { canAccessAdmin } from "@/lib/auth-utils";
import { AdminChrome } from "@/components/admin/admin-chrome";
import { AdminBodyTheme } from "@/components/admin/admin-body-theme";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  if (!canAccessAdmin(user.role)) {
    await redirectTo("/dashboard");
  }

  return (
    <>
      <AdminBodyTheme />
      <AdminChrome>{children}</AdminChrome>
    </>
  );
}
