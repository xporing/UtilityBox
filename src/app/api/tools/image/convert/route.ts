import sharp, { FormatEnum } from "sharp";
import JSZip from "jszip";
import { handleRouteError, jsonError, requireApiUser } from "@/lib/api";
import { assertFile, fileToBuffer, imageMimeTypes, logToolUsage, maxBatchFiles } from "@/lib/files";
import { rateLimit } from "@/lib/rate-limit";
import { slugFileName } from "@/lib/utils";

export const runtime = "nodejs";

const formats: Record<string, keyof FormatEnum> = { jpg: "jpeg", jpeg: "jpeg", png: "png", webp: "webp", avif: "avif" };

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const limited = rateLimit(`${user.id}:image-convert`);
    if (!limited.allowed) return jsonError("Rate limit reached. Try again soon.", 429);
    const form = await request.formData();
    const files = form.getAll("files").filter((item): item is File => item instanceof File);
    const format = String(form.get("format") || "webp").toLowerCase();
    const quality = Math.min(100, Math.max(1, Number(form.get("quality") || 82)));
    if (!formats[format]) return jsonError("Unsupported output format.");
    if (!files.length) return jsonError("No files uploaded.");
    if (files.length > maxBatchFiles) return jsonError(`Batch limit is ${maxBatchFiles} files.`);

    const outputs: Array<{ name: string; data: Buffer }> = [];
    const errors: string[] = [];
    for (const file of files) {
      try {
        assertFile(file, imageMimeTypes);
        const input = await fileToBuffer(file);
        const ext = format === "jpg" ? "jpg" : format;
        const data = await sharp(input, { limitInputPixels: 80_000_000 }).rotate().toFormat(formats[format], { quality }).toBuffer();
        outputs.push({ name: `${slugFileName(file.name.replace(/\.[^.]+$/, ""))}.${ext}`, data });
        await logToolUsage({ userId: user.id, toolName: "Image Converter", action: `convert-to-${format}`, fileSize: file.size });
      } catch (error) { errors.push(`${file.name}: ${(error as Error).message}`); }
    }
    if (!outputs.length) return jsonError(errors.join(" ") || "No files could be converted.");

    if (outputs.length === 1) {
      return new Response(new Uint8Array(outputs[0].data), { headers: { "content-type": `image/${format === "jpg" ? "jpeg" : format}`, "content-disposition": `attachment; filename="${outputs[0].name}"`, "x-filename": outputs[0].name } });
    }
    const zip = new JSZip();
    outputs.forEach((out) => zip.file(out.name, out.data));
    if (errors.length) zip.file("errors.txt", errors.join("\n"));
    const zipped = await zip.generateAsync({ type: "nodebuffer" });
    return new Response(new Uint8Array(zipped), { headers: { "content-type": "application/zip", "content-disposition": 'attachment; filename="converted-images.zip"', "x-filename": "converted-images.zip" } });
  } catch (error) { return handleRouteError(error); }
}

