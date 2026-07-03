"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";

type Meta = { title: string; contentType: string; size: number | null; url: string };

export function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);

  async function detect() {
    setLoading(true); setMeta(null);
    const response = await fetch("/api/tools/video-downloader/metadata", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url }) });
    const data = await response.json(); setLoading(false);
    if (!response.ok) return toast.error(data.error || "Unsupported URL.");
    setMeta(data); toast.success("Supported direct media URL detected.");
  }
  function download() { if (!meta) return; window.location.href = `/api/tools/video-downloader/download?url=${encodeURIComponent(meta.url)}`; }

  return (
    <div className="space-y-5">
      <p className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">Legal-use notice: this tool only supports direct media URLs for user-owned, public domain, or explicitly allowed sources. It does not bypass DRM, paywalls, login restrictions, copyright controls, or platform terms.</p>
      <div className="flex gap-2"><Input value={url} onChange={(e)=>setUrl(e.target.value)} placeholder="https://example.com/video.mp4" /><Button onClick={detect} disabled={loading}>{loading ? "Checking..." : "Detect"}</Button></div>
      {meta && <Card><CardContent className="space-y-3 pt-6"><div className="font-semibold">{meta.title}</div><div className="text-sm text-muted-foreground">Type: {meta.contentType}</div><div className="text-sm text-muted-foreground">Size: {meta.size ? formatBytes(meta.size) : "Unknown"}</div><Button onClick={download}>Download supported file</Button></CardContent></Card>}
    </div>
  );
}
