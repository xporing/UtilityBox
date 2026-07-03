import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Logo } from "@/components/logo";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <ForgotPasswordForm />
        <p className="mt-6 text-center text-sm text-muted-foreground"><Link className="text-primary hover:underline" href="/login">Back to login</Link></p>
      </div>
    </main>
  );
}
