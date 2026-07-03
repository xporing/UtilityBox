"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const response = await fetch("/api/register", { method: "POST", body: formData });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      toast.error(data.error || "Unable to register.");
      return;
    }
    toast.success("Account created. You can log in now.");
    router.push("/login");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Registration may require an admin invite code.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <Input required name="name" placeholder="Name" autoComplete="name" />
          <Input required type="email" name="email" placeholder="email@example.com" autoComplete="email" />
          <Input required type="password" name="password" placeholder="Strong password" autoComplete="new-password" minLength={8} />
          <Input name="inviteToken" placeholder="Invite code (if required)" />
          <Button disabled={loading} className="w-full">{loading ? "Creating..." : "Create account"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
