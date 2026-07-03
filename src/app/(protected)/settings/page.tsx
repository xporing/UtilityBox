import { SettingsClient } from "@/components/settings/settings-client";
import { requireUser } from "@/lib/authz";

export default async function SettingsPage() {
  const user = await requireUser();
  return <SettingsClient user={user} />;
}
