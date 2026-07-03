import { auth } from "@/auth";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function getApiUser() {
  const session = await auth();
  if (!session?.user || session.user.status !== "active") return null;
  return session.user;
}

export async function requireApiUser() {
  const user = await getApiUser();
  if (!user) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  return user;
}

export async function requireApiAdmin() {
  const user = await requireApiUser();
  if (user.role !== "admin") throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  return user;
}

export function handleRouteError(error: unknown) {
  if (error instanceof Response) return error;
  console.error(error);
  return jsonError("Something went wrong. Please try again.", 500);
}
