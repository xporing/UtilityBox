"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function QrGenerator() {
  const [type, setType] = useState("URL");
  const [value, setValue] = useState("https://example.com");
  const [size, setSize] = useState(320);
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const [fg, setFg] = useState("#0f172a");
  const [bg, setBg] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const encoded = useMemo(() => {
    if (type === "Email") return `mailto:${value}`;
    if (type === "Phone") return `tel:${value}`;
    if (type === "Wi-Fi") return `WIFI:T:WPA;S:${value.split('|')[0] || ''};P:${value.split('|')[1] || ''};;`;
    if (type === "vCard") return `BEGIN:VCARD\nVERSION:3.0\n${value}\nEND:VCARD`;
    return value;
  }, [type, value]);

  useEffect(() => { if (canvasRef.current) QRCode.toCanvas(canvasRef.current, encoded || " ", { width: size, errorCorrectionLevel: level, color: { dark: fg, light: bg } }); }, [encoded, size, level, fg, bg]);
  async function copy() { await navigator.clipboard.writeText(encoded); toast.success("Encoded value copied."); }
  async function downloadPng() { const url = canvasRef.current?.toDataURL("image/png"); if (!url) return; const a = document.createElement("a"); a.href = url; a.download = "qr-code.png"; a.click(); }
  async function downloadSvg() { const svg = await QRCode.toString(encoded || " ", { type: "svg", width: size, errorCorrectionLevel: level, color: { dark: fg, light: bg } }); const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); const a = document.createElement("a"); a.href = url; a.download = "qr-code.svg"; a.click(); URL.revokeObjectURL(url); }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <select className="h-10 w-full rounded-lg border bg-background px-3 text-sm" value={type} onChange={(e)=>setType(e.target.value)}>{["URL","Text","Email","Phone","Wi-Fi","vCard"].map(t => <option key={t}>{t}</option>)}</select>
        <Textarea value={value} onChange={(e)=>setValue(e.target.value)} placeholder={type === "Wi-Fi" ? "SSID|password" : "Value to encode"} />
        <div className="grid gap-4 sm:grid-cols-2"><Input type="number" min="128" max="1024" value={size} onChange={(e)=>setSize(Number(e.target.value))} /><select className="h-10 rounded-lg border bg-background px-3 text-sm" value={level} onChange={(e)=>setLevel(e.target.value as any)}>{["L","M","Q","H"].map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Foreground<Input type="color" value={fg} onChange={(e)=>setFg(e.target.value)} /></label><label className="text-sm">Background<Input type="color" value={bg} onChange={(e)=>setBg(e.target.value)} /></label></div>
        <div className="flex flex-wrap gap-2"><Button onClick={downloadPng}>Download PNG</Button><Button variant="outline" onClick={downloadSvg}>Download SVG</Button><Button variant="ghost" onClick={copy}>Copy encoded value</Button></div>
      </div>
      <div className="flex items-center justify-center rounded-xl border bg-white p-4"><canvas ref={canvasRef} /></div>
    </div>
  );
}
