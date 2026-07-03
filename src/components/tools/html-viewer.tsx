"use client";

import { useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function HtmlViewer() {
  const [html, setHtml] = useState("<h1>Hello UtilityBox</h1>\n<p>Preview your HTML safely.</p>");
  const [css, setCss] = useState("body{font-family:system-ui;padding:2rem} h1{color:#0ea5e9}");
  const [js, setJs] = useState("console.log('JS enabled intentionally')");
  const [allowJs, setAllowJs] = useState(false);

  const srcDoc = useMemo(() => {
    const safeHtml = allowJs ? html : DOMPurify.sanitize(html, { FORBID_TAGS: ["script"], FORBID_ATTR: ["onerror", "onload", "onclick"] });
    return `<!doctype html><html><head><style>${css}</style></head><body>${safeHtml}${allowJs ? `<script>${js}</script>` : ""}</body></html>`;
  }, [html, css, js, allowJs]);

  async function copy() { await navigator.clipboard.writeText(srcDoc); toast.success("HTML copied."); }
  function download() { const url = URL.createObjectURL(new Blob([srcDoc], { type: "text/html" })); const a = document.createElement("a"); a.href = url; a.download = "utilitybox-preview.html"; a.click(); URL.revokeObjectURL(url); }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-3">
        <Textarea value={html} onChange={(e)=>setHtml(e.target.value)} className="min-h-[220px] font-mono" placeholder="Paste HTML" />
        <Textarea value={css} onChange={(e)=>setCss(e.target.value)} className="min-h-[120px] font-mono" placeholder="Optional CSS" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={allowJs} onChange={(e)=>setAllowJs(e.target.checked)} /> Enable JavaScript preview</label>
        {allowJs && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">JavaScript runs only inside the sandboxed iframe. Enable it only for code you trust.</p>}
        {allowJs && <Textarea value={js} onChange={(e)=>setJs(e.target.value)} className="min-h-[100px] font-mono" placeholder="Optional JavaScript" />}
        <div className="flex flex-wrap gap-2"><Button onClick={copy}>Copy HTML</Button><Button variant="outline" onClick={download}>Download .html</Button><Button variant="ghost" onClick={()=>{setHtml(''); setCss(''); setJs('');}}>Clear</Button></div>
      </div>
      <iframe title="HTML preview" srcDoc={srcDoc} sandbox={allowJs ? "allow-scripts" : ""} className="h-[560px] w-full rounded-xl border bg-white" />
    </div>
  );
}
