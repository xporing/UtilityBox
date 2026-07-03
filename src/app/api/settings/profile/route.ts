import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, requireApiUser } from "@/lib/api";

const schema = z.object({ name: z.string().min(1).max(120) });

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const formData = await request.formData();
    const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return jsonError("Name is required.");
    await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
    return Response.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
