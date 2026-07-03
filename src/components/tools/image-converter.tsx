"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

export function ImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("webp");
  const [quality, setQuality] = useState(82);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function convert() {
    if (!files.length) return toast.error("Upload at least one image.");
    setLoading(true); setProgress(35);
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    form.append("format", format); form.append("quality", String(quality));
    const response = await fetch("/api/tools/image/convert", { method: "POST", body: form });
    setProgress(85);
    if (!response.ok) { toast.error((await response.json()).error || "Conversion failed."); setLoading(false); setProgress(0); return; }
    const blob = await response.blob();
    saveBlob(blob, response.headers.get("x-filename") || (files.length > 1 ? "converted-images.zip" : `converted.${format}`));
    toast.success("Converted image ready.");
    setLoading(false); setProgress(100); setTimeout(() => setProgress(0), 800);
  }

  return (
    <div className="space-y-5">
      <FileDropzone files={files} setFiles={setFiles} multiple accept="image/*,.heic,.heif,.svg" note="Max size follows server setting. SVG input may not render perfectly if complex." />
      <div className="grid gap-4 sm:grid-cols-2"><select className="h-10 rounded-lg border bg-background px-3 text-sm" value={format} onChange={(e) => setFormat(e.target.value)}>{["jpg","png","webp","avif"].map(f => <option key={f}>{f}</option>)}</select><Input type="number" min="1" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} placeholder="Quality" /></div>
      {loading && <Progress value={progress} />}
      <Button onClick={convert} disabled={loading}>{loading ? "Converting..." : "Convert and download"}</Button>
    </div>
  );
}
