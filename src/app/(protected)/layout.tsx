import { DashboardShell } from "@/components/dashboard-shell";
import { requireUser } from "@/lib/authz";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <DashboardShell user={user}>{children}</DashboardShell>;
}
