import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return Response.json({ ok: true });

  // Production note: create a password reset token table and send an email via SMTP here.
  // We intentionally return a generic success response to avoid account enumeration.
  console.info(`Password reset requested for ${parsed.data.email}`);
  return Response.json({ ok: true });
}
