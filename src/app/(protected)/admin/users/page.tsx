import { requireAdmin } from "@/lib/authz";
import { AdminUsersClient } from "@/components/admin/admin-users-client";

export default async function AdminUsersPage() {
  await requireAdmin();
  return <AdminUsersClient />;
}
