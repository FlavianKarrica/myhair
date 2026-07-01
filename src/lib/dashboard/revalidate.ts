import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

const dashboardPaths = ["", "/bookings", "/staff", "/services", "/schedule"];

export function revalidateDashboardPages() {
  for (const locale of routing.locales) {
    for (const path of dashboardPaths) {
      revalidatePath(`/${locale}/dashboard${path}`);
    }
  }
}
