"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      redirect: false
    });
    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password, or account is disabled.");
      return;
    }
    toast.success("Welcome back.");
    window.location.href = params.get("next") || "/dashboard";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login to UtilityBox</CardTitle>
        <CardDescription>Private tools are only available after login.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <Input required type="email" name="email" placeholder="email@example.com" autoComplete="email" />
          <Input required type="password" name="password" placeholder="Password" autoComplete="current-password" />
          <Button disabled={loading} className="w-full">{loading ? "Logging in..." : "Login"}</Button>
        </form>
        <div className="mt-4 text-center text-sm"><Link href="/forgot-password" className="text-primary hover:underline">Forgot password?</Link></div>
      </CardContent>
    </Card>
  );
}

