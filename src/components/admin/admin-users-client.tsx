"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type User = { id: string; email: string; name: string | null; role: "admin" | "user"; status: "active" | "disabled"; createdAt: string; lastLoginAt: string | null; _count: { toolUsage: number } };

type Invite = { id: string; email: string | null; token: string; role: "admin" | "user"; expiresAt: string; usedAt: string | null; createdAt: string };

export function AdminUsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/users");
    const data = await response.json();
    if (response.ok) { setUsers(data.users); setInvites(data.invites); }
    else toast.error(data.error || "Failed to load users.");
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function invite(formData: FormData) {
    const response = await fetch("/api/admin/users", { method: "POST", body: formData });
    const data = await response.json();
    if (response.ok) { toast.success(`Invite created: ${data.token}`); await load(); }
    else toast.error(data.error || "Invite failed.");
  }

  async function patch(id: string, data: object) {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, ...data }) });
    if (response.ok) { toast.success("User updated."); await load(); }
    else toast.error((await response.json()).error || "Update failed.");
  }

  async function remove(id: string) {
    if (!confirm("Delete this user permanently?")) return;
    const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    if (response.ok) { toast.success("User deleted."); await load(); }
    else toast.error((await response.json()).error || "Delete failed.");
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Admin user management</h1><p className="mt-2 text-muted-foreground">Invite, disable, delete, and change roles for UtilityBox users.</p></div>
      <Card><CardHeader><CardTitle>Invite user</CardTitle><CardDescription>Optional email binding prevents invite reuse by a different email.</CardDescription></CardHeader><CardContent><form action={invite} className="grid gap-3 md:grid-cols-[1fr_160px_160px_auto]"><Input type="email" name="email" placeholder="email@example.com (optional)" /><select name="role" className="h-10 rounded-lg border bg-background px-3 text-sm"><option value="user">user</option><option value="admin">admin</option></select><Input name="days" type="number" defaultValue={7} min={1} max={90} /><Button>Create invite</Button></form></CardContent></Card>
      <Card><CardHeader><CardTitle>Users</CardTitle></CardHeader><CardContent>{loading ? <p>Loading...</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left"><th className="p-2">User</th><th>Role</th><th>Status</th><th>Last login</th><th>Usage</th><th className="text-right">Actions</th></tr></thead><tbody>{users.map(user => <tr key={user.id} className="border-b"><td className="p-2"><div className="font-medium">{user.name || '—'}</div><div className="text-muted-foreground">{user.email}</div></td><td><select value={user.role} onChange={(e)=>patch(user.id,{role:e.target.value})} className="rounded border bg-background p-1"><option>user</option><option>admin</option></select></td><td><Badge variant={user.status === 'active' ? 'success' : 'danger'}>{user.status}</Badge></td><td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</td><td>{user._count.toolUsage}</td><td className="space-x-2 text-right"><Button size="sm" variant="outline" onClick={()=>patch(user.id,{status:user.status === 'active' ? 'disabled' : 'active'})}>{user.status === 'active' ? 'Disable' : 'Enable'}</Button><Button size="sm" variant="destructive" onClick={()=>remove(user.id)}>Delete</Button></td></tr>)}</tbody></table></div>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Recent invites</CardTitle></CardHeader><CardContent><div className="divide-y">{invites.map(invite => <div key={invite.id} className="py-3 text-sm"><div className="font-mono">{invite.token}</div><div className="text-muted-foreground">{invite.email || 'Any email'} · {invite.role} · expires {new Date(invite.expiresAt).toLocaleDateString()} · {invite.usedAt ? 'used' : 'unused'}</div></div>)}</div></CardContent></Card>
    </div>
  );
}
