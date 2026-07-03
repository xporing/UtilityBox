import { prisma } from "@/lib/prisma";

export const maxUploadMb = Number(process.env.MAX_UPLOAD_MB ?? 50);
export const maxUploadBytes = maxUploadMb * 1024 * 1024;
export const maxBatchFiles = Number(process.env.MAX_BATCH_FILES ?? 10);

export const imageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/svg+xml"
]);

export const videoMimeTypes = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "video/x-msvideo",
  "video/mpeg"
]);

export function assertFile(file: File, allowedTypes: Set<string>, maxBytes = maxUploadBytes) {
  if (file.size <= 0) throw new Error("Empty files are not supported.");
  if (file.size > maxBytes) throw new Error(`File is too large. Max size is ${maxUploadMb} MB.`);
  if (!allowedTypes.has(file.type)) throw new Error(`Unsupported file type: ${file.type || "unknown"}.`);
}

export async function fileToBuffer(file: File) {
  return Buffer.from(await file.arrayBuffer());
}

export async function logToolUsage(input: { userId: string; toolName: string; action: string; fileSize?: number }) {
  try {
    await prisma.toolUsage.create({ data: input });
  } catch (error) {
    console.error("Unable to log tool usage", error);
  }
}
