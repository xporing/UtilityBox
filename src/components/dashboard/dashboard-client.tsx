"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { tools, categories } from "@/lib/tools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatBytes } from "@/lib/utils";

export function DashboardClient({ user, recent }: { user: { name?: string | null; role: "admin" | "user" }; recent: Array<{ id: string; toolName: string; action: string; fileSize: number | null; createdAt: string }> }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");

  const visibleTools = useMemo(() => tools.filter((tool) => {
    const matchesQuery = `${tool.title} ${tool.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All" || tool.category === category;
    return matchesQuery && matchesCategory;
  }), [query, category]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Badge>Private dashboard</Badge>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Welcome{user.name ? `, ${user.name}` : ""}</h1>
          <p className="mt-2 text-muted-foreground">All tools are protected behind login. Pick a utility and start working.</p>
        </div>
        {user.role === "admin" && <Button asChild><Link href="/admin/users">Admin Users</Link></Button>}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools..." className="pl-9" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => <Button key={cat} size="sm" type="button" variant={category === cat ? "default" : "outline"} onClick={() => setCategory(cat)}>{cat}</Button>)}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.href} className="overflow-hidden">
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Badge variant="muted">{tool.category}</Badge>
                <Button asChild><Link href={tool.href}>Open Tool</Link></Button>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest tool actions logged for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : (
            <div className="divide-y">
              {recent.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 text-sm">
                  <div><div className="font-medium">{item.toolName}</div><div className="text-muted-foreground">{item.action}</div></div>
                  <div className="text-right text-muted-foreground"><div>{item.fileSize ? formatBytes(item.fileSize) : "—"}</div><div>{new Date(item.createdAt).toLocaleString()}</div></div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
