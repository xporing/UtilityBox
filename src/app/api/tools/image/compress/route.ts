import sharp from "sharp";
import JSZip from "jszip";
import { handleRouteError, jsonError, requireApiUser } from "@/lib/api";
import { assertFile, fileToBuffer, imageMimeTypes, logToolUsage, maxBatchFiles } from "@/lib/files";
import { rateLimit } from "@/lib/rate-limit";
import { slugFileName } from "@/lib/utils";

export const runtime = "nodejs";

async function compressBuffer(input: Buffer, quality: number, lossless: boolean) {
  if (lossless) return sharp(input, { limitInputPixels: 80_000_000 }).rotate().webp({ lossless: true }).toBuffer();
  return sharp(input, { limitInputPixels: 80_000_000 }).rotate().webp({ quality, effort: 4 }).toBuffer();
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    if (!rateLimit(`${user.id}:image-compress`).allowed) return jsonError("Rate limit reached. Try again soon.", 429);
    const form = await request.formData();
    const files = form.getAll("files").filter((item): item is File => item instanceof File);
    const quality = Math.min(100, Math.max(1, Number(form.get("quality") || 75)));
    const lossless = String(form.get("lossless")) === "true";
    if (!files.length) return jsonError("No files uploaded.");
    if (files.length > maxBatchFiles) return jsonError(`Batch limit is ${maxBatchFiles} files.`);
    const outputs: Array<{ name: string; data: Buffer }> = [];
    const summary: string[] = [];
    for (const file of files) {
      assertFile(file, imageMimeTypes);
      const data = await compressBuffer(await fileToBuffer(file), quality, lossless);
      const saved = Math.max(0, Math.round((1 - data.length / file.size) * 100));
      const name = `${slugFileName(file.name.replace(/\.[^.]+$/, ""))}-compressed.webp`;
      outputs.push({ name, data });
      summary.push(`${file.name}: ${file.size} -> ${data.length} bytes (${saved}% saved)`);
      await logToolUsage({ userId: user.id, toolName: "Image Compressor", action: lossless ? "lossless" : `quality-${quality}`, fileSize: file.size });
    }
    if (outputs.length === 1) return new Response(outputs[0].data, { headers: { "content-type": "image/webp", "content-disposition": `attachment; filename="${outputs[0].name}"`, "x-filename": outputs[0].name, "x-compression-summary": summary[0] } });
    const zip = new JSZip(); outputs.forEach((out) => zip.file(out.name, out.data)); zip.file("summary.txt", summary.join("\n"));
    const zipped = await zip.generateAsync({ type: "nodebuffer" });
    return new Response(zipped, { headers: { "content-type": "application/zip", "content-disposition": 'attachment; filename="compressed-images.zip"', "x-filename": "compressed-images.zip" } });
  } catch (error) { return handleRouteError(error); }
}
