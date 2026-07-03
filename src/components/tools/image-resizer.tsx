"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const presets: Record<string, { width: number; height: number }> = {
  "Instagram post": { width: 1080, height: 1080 },
  "Instagram story": { width: 1080, height: 1920 },
  "YouTube thumbnail": { width: 1280, height: 720 },
  "Facebook post": { width: 1200, height: 630 },
  "X/Twitter post": { width: 1600, height: 900 },
  "Website banner": { width: 1920, height: 640 },
  Custom: { width: 1200, height: 800 }
};

function saveBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

export function ImageResizer() {
  const [files, setFiles] = useState<File[]>([]);
  const [preset, setPreset] = useState("Instagram post");
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [percent, setPercent] = useState(100);
  const [maintain, setMaintain] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (preset !== "Custom") { setWidth(presets[preset].width); setHeight(presets[preset].height); } }, [preset]);
  useEffect(() => { if (!files[0]) { setPreview(null); return; } const url = URL.createObjectURL(files[0]); setPreview(url); return () => URL.revokeObjectURL(url); }, [files]);

  async function resize() {
    if (!files[0]) return toast.error("Upload an image.");
    setLoading(true);
    const form = new FormData();
    form.append("file", files[0]); form.append("width", String(width)); form.append("height", String(height)); form.append("percent", String(percent)); form.append("maintain", String(maintain));
    const response = await fetch("/api/tools/image/resize", { method: "POST", body: form });
    if (!response.ok) { toast.error((await response.json()).error || "Resize failed."); setLoading(false); return; }
    saveBlob(await response.blob(), response.headers.get("x-filename") || "resized-image.webp");
    setLoading(false); toast.success("Resized image ready.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <FileDropzone files={files} setFiles={setFiles} accept="image/*,.heic,.heif,.svg" note="Upload one image. Preview is local before processing." />
        <select className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={preset} onChange={(e)=>setPreset(e.target.value)}>{Object.keys(presets).map(p => <option key={p}>{p}</option>)}</select>
        <div className="grid gap-4 sm:grid-cols-3"><Input type="number" value={width} onChange={(e)=>{setPreset('Custom'); setWidth(Number(e.target.value));}} /><Input type="number" value={height} onChange={(e)=>{setPreset('Custom'); setHeight(Number(e.target.value));}} /><Input type="number" value={percent} onChange={(e)=>setPercent(Number(e.target.value))} /></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={maintain} onChange={(e)=>setMaintain(e.target.checked)} /> Maintain aspect ratio</label>
        <Button onClick={resize} disabled={loading}>{loading ? "Resizing..." : "Resize and download"}</Button>
      </div>
      <div className="rounded-xl border bg-muted/40 p-3"><p className="mb-2 text-sm font-medium">Preview</p>{preview ? <img src={preview} alt="Preview" className="max-h-80 w-full rounded-lg object-contain" /> : <div className="flex h-80 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">No image</div>}</div>
    </div>
  );
}
