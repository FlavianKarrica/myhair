import { auth } from "@/auth";
import type { UserRole } from "@/generated/prisma/client";

export type TenantContext = {
  userId: string;
  tenantId: string;
  role: UserRole;
  name: string;
};

export async function getTenantContext(): Promise<TenantContext | null> {
  const session = await auth();
  const user = session?.user;

  if (!user?.tenantId) return null;

  return {
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    name: user.name ?? "",
  };
}

export function isOwner(role: UserRole): boolean {
  return role === "OWNER";
}
