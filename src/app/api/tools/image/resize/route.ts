import sharp from "sharp";
import { handleRouteError, jsonError, requireApiUser } from "@/lib/api";
import { assertFile, fileToBuffer, imageMimeTypes, logToolUsage } from "@/lib/files";
import { rateLimit } from "@/lib/rate-limit";
import { slugFileName } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    if (!rateLimit(`${user.id}:image-resize`).allowed) return jsonError("Rate limit reached. Try again soon.", 429);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return jsonError("No image uploaded.");
    assertFile(file, imageMimeTypes);
    const width = Math.max(1, Number(form.get("width") || 1080));
    const height = Math.max(1, Number(form.get("height") || 1080));
    const percent = Math.max(1, Number(form.get("percent") || 100));
    const maintain = String(form.get("maintain")) === "true";
    const metadata = await sharp(await fileToBuffer(file)).metadata();
    const targetWidth = Math.round(width * percent / 100);
    const targetHeight = Math.round(height * percent / 100);
    const data = await sharp(await fileToBuffer(file), { limitInputPixels: 80_000_000 })
      .rotate()
      .resize({ width: targetWidth, height: targetHeight, fit: maintain ? "inside" : "fill", withoutEnlargement: false })
      .webp({ quality: 90 })
      .toBuffer();
    await logToolUsage({ userId: user.id, toolName: "Image Resizer", action: `${metadata.width || "?"}x${metadata.height || "?"}-to-${targetWidth}x${targetHeight}`, fileSize: file.size });
    const name = `${slugFileName(file.name.replace(/\.[^.]+$/, ""))}-resized.webp`;
    return new Response(new Uint8Array(data), { headers: { "content-type": "image/webp", "content-disposition": `attachment; filename="${name}"`, "x-filename": name } });
  } catch (error) { return handleRouteError(error); }
}

