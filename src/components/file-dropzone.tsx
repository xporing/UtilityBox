"use client";

import { UploadCloud, X } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatBytes, cn } from "@/lib/utils";

export function FileDropzone({ files, setFiles, multiple = false, accept, note }: { files: File[]; setFiles: (files: File[]) => void; multiple?: boolean; accept?: string; note?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function add(list: FileList | null) {
    if (!list) return;
    setFiles(multiple ? [...files, ...Array.from(list)] : [list[0]]);
  }

  return (
    <div
      className="file-grid-bg rounded-xl border border-dashed p-6 text-center"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
    >
      <input ref={inputRef} type="file" className="hidden" multiple={multiple} accept={accept} onChange={(e) => add(e.target.files)} />
      <UploadCloud className="mx-auto h-10 w-10 text-primary" />
      <p className="mt-3 font-medium">Drag and drop files here</p>
      <p className="mt-1 text-sm text-muted-foreground">{note || "or browse from your device"}</p>
      <Button className="mt-4" variant="outline" type="button" onClick={() => inputRef.current?.click()}>Choose file{multiple ? "s" : ""}</Button>
      {files.length > 0 && (
        <div className="mt-4 space-y-2 text-left">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm">
              <span className="truncate">{file.name} <span className="text-muted-foreground">({formatBytes(file.size)})</span></span>
              <button type="button" className="rounded p-1 hover:bg-muted" onClick={() => setFiles(files.filter((_, i) => i !== index))}><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
