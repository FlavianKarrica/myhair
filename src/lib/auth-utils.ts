import type { UserRole } from "@/generated/prisma/client";

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin";
    case "OWNER":
    case "STAFF":
      return "/dashboard";
    default:
      return "/";
  }
}

export function canAccessAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN";
}

export function canAccessDashboard(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "OWNER" || role === "STAFF";
}
