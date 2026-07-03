"use client";

import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function SettingsClient({ user }: { user: { name?: string | null; email?: string | null; role: "admin" | "user" } }) {
  const { setTheme, theme } = useTheme();

  async function updateProfile(formData: FormData) {
    const response = await fetch("/api/settings/profile", { method: "PATCH", body: formData });
    if (response.ok) toast.success("Profile updated. Sign in again to refresh session details.");
    else toast.error((await response.json()).error || "Update failed.");
  }

  async function updatePassword(formData: FormData) {
    const response = await fetch("/api/settings/password", { method: "PATCH", body: formData });
    if (response.ok) toast.success("Password updated.");
    else toast.error((await response.json()).error || "Password update failed.");
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tracking-tight">Settings</h1><p className="mt-2 text-muted-foreground">Manage account details and preferences.</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Update your display name.</CardDescription></CardHeader>
          <CardContent>
            <form action={updateProfile} className="space-y-4">
              <Input name="name" defaultValue={user.name ?? ""} placeholder="Name" />
              <Input value={user.email ?? ""} disabled />
              <div className="text-sm">Role: <Badge>{user.role}</Badge></div>
              <Button>Save profile</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Security</CardTitle><CardDescription>Change password and session state.</CardDescription></CardHeader>
          <CardContent>
            <form action={updatePassword} className="space-y-4">
              <Input type="password" name="currentPassword" placeholder="Current password" required />
              <Input type="password" name="newPassword" placeholder="New password" minLength={8} required />
              <Button>Change password</Button>
            </form>
            <Button variant="outline" className="mt-4" onClick={() => signOut({ callbackUrl: "/login" })}>Log out</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Choose the interface theme.</CardDescription></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {['light','dark','system'].map((item) => <Button key={item} variant={theme === item ? 'default' : 'outline'} onClick={() => setTheme(item)}>{item}</Button>)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
