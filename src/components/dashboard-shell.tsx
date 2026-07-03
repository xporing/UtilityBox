"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Settings, ShieldCheck, LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function DashboardShell({ children, user }: { children: React.ReactNode; user: { name?: string | null; email?: string | null; role: "admin" | "user" } }) {
  const pathname = usePathname();
  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...tools.map((tool) => ({ href: tool.href, label: tool.title, icon: tool.icon })),
    ...(user.role === "admin" ? [{ href: "/admin/users", label: "Admin Users", icon: ShieldCheck }] : []),
    { href: "/settings", label: "Settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-card/70 backdrop-blur lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <div className="border-b p-5"><Logo /></div>
          <nav className="flex-1 overflow-y-auto p-3">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={cn("mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground", active && "bg-primary/10 text-primary")}> 
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-4">
            <div className="mb-3 rounded-lg bg-muted p-3 text-xs">
              <div className="font-semibold text-foreground">{user.name || "UtilityBox User"}</div>
              <div className="truncate text-muted-foreground">{user.email}</div>
            </div>
            <div className="flex gap-2">
              <ModeToggle />
              <Button variant="outline" className="flex-1" onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <main>
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 p-3 backdrop-blur lg:hidden">
          <Logo />
          <div className="flex gap-2"><ModeToggle /><Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>Logout</Button></div>
        </header>
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
