import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/authz";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const user = await requireUser();
  const recent = await prisma.toolUsage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  return <DashboardClient user={user} recent={recent.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() }))} />;
}
