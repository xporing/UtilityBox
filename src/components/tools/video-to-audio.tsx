"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

function saveBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); }

export function VideoToAudio() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("mp3");
  const [quality, setQuality] = useState("192k");
  const [loading, setLoading] = useState(false);

  async function convert() {
    if (!files[0]) return toast.error("Upload a video file.");
    setLoading(true);
    const form = new FormData(); form.append("file", files[0]); form.append("format", format); form.append("quality", quality);
    const response = await fetch("/api/tools/video-to-audio", { method: "POST", body: form });
    if (!response.ok) { toast.error((await response.json()).error || "Audio extraction failed."); setLoading(false); return; }
    saveBlob(await response.blob(), response.headers.get("x-filename") || `audio.${format}`);
    toast.success("Audio extracted."); setLoading(false);
  }

  return (
    <div className="space-y-5">
      <FileDropzone files={files} setFiles={setFiles} accept="video/*" note="Requires FFmpeg. For large videos, Docker hosting is recommended." />
      <div className="grid gap-4 sm:grid-cols-2"><select className="h-10 rounded-lg border bg-background px-3 text-sm" value={format} onChange={(e)=>setFormat(e.target.value)}>{["mp3","wav","m4a"].map(f => <option key={f}>{f}</option>)}</select><select className="h-10 rounded-lg border bg-background px-3 text-sm" value={quality} onChange={(e)=>setQuality(e.target.value)}>{["128k","192k","256k","320k"].map(q => <option key={q}>{q}</option>)}</select></div>
      {loading && <Progress value={65} />}
      <Button onClick={convert} disabled={loading}>{loading ? "Extracting..." : "Extract audio"}</Button>
    </div>
  );
}
