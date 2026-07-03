import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need access? <Link className="font-medium text-primary hover:underline" href="/register">Register with an invite code</Link>
        </p>
      </div>
    </main>
  );
}
