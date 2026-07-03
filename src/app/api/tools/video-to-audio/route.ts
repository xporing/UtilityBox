import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import ffmpegPath from "ffmpeg-static";
import { handleRouteError, jsonError, requireApiUser } from "@/lib/api";
import { assertFile, fileToBuffer, logToolUsage, videoMimeTypes } from "@/lib/files";
import { rateLimit } from "@/lib/rate-limit";
import { slugFileName } from "@/lib/utils";

export const runtime = "nodejs";

const codecs: Record<string, string[]> = {
  mp3: ["-vn", "-codec:a", "libmp3lame"],
  wav: ["-vn", "-codec:a", "pcm_s16le"],
  m4a: ["-vn", "-codec:a", "aac"]
};

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const binary = ffmpegPath || "ffmpeg";
    const child = spawn(binary, args);
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `FFmpeg exited with code ${code}`)));
  });
}

export async function POST(request: Request) {
  let dir: string | null = null;
  try {
    const user = await requireApiUser();
    if (!rateLimit(`${user.id}:video-audio`, 6).allowed) return jsonError("Rate limit reached. Try again soon.", 429);
    const form = await request.formData();
    const file = form.get("file");
    const format = String(form.get("format") || "mp3").toLowerCase();
    const quality = String(form.get("quality") || "192k");
    if (!(file instanceof File)) return jsonError("No video uploaded.");
    if (!codecs[format]) return jsonError("Unsupported audio format.");
    assertFile(file, videoMimeTypes);
    dir = await mkdtemp(path.join(tmpdir(), "utilitybox-"));
    const inputPath = path.join(dir, slugFileName(file.name));
    const outputName = `${slugFileName(file.name.replace(/\.[^.]+$/, ""))}.${format}`;
    const outputPath = path.join(dir, outputName);
    await writeFile(inputPath, await fileToBuffer(file));
    const bitrate = format === "wav" ? [] : ["-b:a", quality];
    await runFfmpeg(["-y", "-i", inputPath, ...codecs[format], ...bitrate, outputPath]);
    const output = await readFile(outputPath);
    await logToolUsage({ userId: user.id, toolName: "Video to Audio", action: `extract-${format}`, fileSize: file.size });
    return new Response(new Uint8Array(output), { headers: { "content-type": format === "wav" ? "audio/wav" : format === "m4a" ? "audio/mp4" : "audio/mpeg", "content-disposition": `attachment; filename="${outputName}"`, "x-filename": outputName } });
  } catch (error) { return handleRouteError(error); }
  finally { if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {}); }
}

