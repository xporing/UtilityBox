"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

function saveBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

export function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(75);
  const [lossless, setLossless] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function compress() {
    if (!files.length) return toast.error("Upload at least one image.");
    setLoading(true); setProgress(30);
    const form = new FormData();
    files.forEach((file) => form.append("files", file)); form.append("quality", String(quality)); form.append("lossless", String(lossless));
    const response = await fetch("/api/tools/image/compress", { method: "POST", body: form });
    setProgress(80);
    if (!response.ok) { toast.error((await response.json()).error || "Compression failed."); setLoading(false); setProgress(0); return; }
    saveBlob(await response.blob(), response.headers.get("x-filename") || (files.length > 1 ? "compressed-images.zip" : "compressed-image.webp"));
    toast.success("Compressed image ready."); setLoading(false); setProgress(100); setTimeout(()=>setProgress(0),800);
  }

  return (
    <div className="space-y-5">
      <FileDropzone files={files} setFiles={setFiles} multiple accept="image/*,.heic,.heif,.svg" note="Lossy compression produces smaller files. Batch downloads are zipped." />
      <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Quality: {quality}<Input type="range" min="1" max="100" value={quality} onChange={(e)=>setQuality(Number(e.target.value))} /></label><label className="mt-6 flex items-center gap-2 text-sm"><input type="checkbox" checked={lossless} onChange={(e)=>setLossless(e.target.checked)} /> Prefer lossless where supported</label></div>
      {loading && <Progress value={progress} />}
      <Button onClick={compress} disabled={loading}>{loading ? "Compressing..." : "Compress and download"}</Button>
    </div>
  );
}
