import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  password: z.string().min(8).max(200),
  inviteToken: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
    if (!parsed.success) return jsonError("Please enter valid registration details.");

    const email = parsed.data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return jsonError("An account with this email already exists.");

    const userCount = await prisma.user.count();
    const allowPublic = process.env.ALLOW_PUBLIC_REGISTRATION === "true";
    const requireInvite = process.env.REQUIRE_INVITE_CODE !== "false";
    let role: "admin" | "user" = process.env.BOOTSTRAP_FIRST_USER_AS_ADMIN === "true" && userCount === 0 ? "admin" : "user";

    if (!allowPublic || requireInvite) {
      if (!parsed.data.inviteToken) return jsonError("Invite code is required.");
      const invite = await prisma.invite.findUnique({ where: { token: parsed.data.inviteToken } });
      if (!invite || invite.usedAt || invite.expiresAt < new Date()) return jsonError("Invite code is invalid or expired.");
      if (invite.email && invite.email.toLowerCase() !== email) return jsonError("Invite code was issued for a different email.");
      role = invite.role;
      await prisma.invite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
    }

    await prisma.user.create({
      data: {
        email,
        name: parsed.data.name,
        passwordHash: await hash(parsed.data.password, 12),
        role,
        status: "active"
      }
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonError("Registration failed.", 500);
  }
}
