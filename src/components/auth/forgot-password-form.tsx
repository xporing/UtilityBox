"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  async function onSubmit(formData: FormData) {
    setLoading(true);
    const response = await fetch("/api/forgot-password", { method: "POST", body: formData });
    setLoading(false);
    if (response.ok) toast.success("If that email exists, reset instructions will be sent when email is configured.");
    else toast.error("Unable to process request.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>This endpoint is ready for SMTP integration and returns a safe generic response.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <Input required type="email" name="email" placeholder="email@example.com" />
          <Button disabled={loading} className="w-full">{loading ? "Checking..." : "Request reset"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
