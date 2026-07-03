import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, requireApiUser } from "@/lib/api";

const schema = z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(8).max(200) });

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const formData = await request.formData();
    const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return jsonError("Please enter a valid password.");
    const record = await prisma.user.findUnique({ where: { id: user.id } });
    if (!record || !(await compare(parsed.data.currentPassword, record.passwordHash))) return jsonError("Current password is incorrect.");
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hash(parsed.data.newPassword, 12) } });
    return Response.json({ ok: true });
  } catch (error) { return handleRouteError(error); }
}
