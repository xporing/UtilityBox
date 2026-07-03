import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleRouteError, jsonError, requireApiAdmin } from "@/lib/api";

export async function GET() {
  try {
    await requireApiAdmin();
    const [users, invites] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, email: true, name: true, role: true, status: true, createdAt: true, lastLoginAt: true, _count: { select: { toolUsage: true } } } }),
      prisma.invite.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
    ]);
    return Response.json({ users, invites });
  } catch (error) { return handleRouteError(error); }
}

const inviteSchema = z.object({ email: z.string().email().optional().or(z.literal("")), role: z.enum(["admin", "user"]), days: z.coerce.number().min(1).max(90).default(7) });

export async function POST(request: Request) {
  try {
    const admin = await requireApiAdmin();
    const formData = await request.formData();
    const parsed = inviteSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return jsonError("Invalid invite details.");
    const token = randomBytes(24).toString("base64url");
    const invite = await prisma.invite.create({ data: { email: parsed.data.email || null, role: parsed.data.role, token, expiresAt: new Date(Date.now() + parsed.data.days * 86400000), createdBy: admin.id } });
    return Response.json(invite);
  } catch (error) { return handleRouteError(error); }
}

const patchSchema = z.object({ id: z.string(), role: z.enum(["admin", "user"]).optional(), status: z.enum(["active", "disabled"]).optional() });

export async function PATCH(request: Request) {
  try {
    const admin = await requireApiAdmin();
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Invalid update.");
    if (parsed.data.id === admin.id && parsed.data.status === "disabled") return jsonError("You cannot disable yourself.");
    await prisma.user.update({ where: { id: parsed.data.id }, data: { role: parsed.data.role, status: parsed.data.status } });
    return Response.json({ ok: true });
  } catch (error) { return handleRouteError(error); }
}

const deleteSchema = z.object({ id: z.string() });

export async function DELETE(request: Request) {
  try {
    const admin = await requireApiAdmin();
    const parsed = deleteSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Invalid delete.");
    if (parsed.data.id === admin.id) return jsonError("You cannot delete yourself.");
    await prisma.user.delete({ where: { id: parsed.data.id } });
    return Response.json({ ok: true });
  } catch (error) { return handleRouteError(error); }
}
