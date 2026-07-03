import { z } from "zod";
import { handleRouteError, jsonError, requireApiUser } from "@/lib/api";
import { rateLimit } from "@/lib/rate-limit";
import { isDownloadableVideoType, validateLegalDirectMediaUrl } from "@/lib/video-url";

export const runtime = "nodejs";
const schema = z.object({ url: z.string().url() });

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    if (!rateLimit(`${user.id}:video-downloader`, 10).allowed) return jsonError("Rate limit reached. Try again soon.", 429);
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Enter a valid URL.");
    const url = await validateLegalDirectMediaUrl(parsed.data.url);
    const head = await fetch(url, { method: "HEAD", redirect: "manual" });
    if (head.status >= 300 && head.status < 400) return jsonError("Redirects are not followed for safety. Use the final direct media URL.");
    const contentType = head.headers.get("content-type");
    if (!isDownloadableVideoType(contentType)) return jsonError("This URL does not look like a supported direct video file.");
    const size = Number(head.headers.get("content-length") || 0) || null;
    const maxMb = Number(process.env.VIDEO_DOWNLOAD_MAX_MB ?? 250);
    if (size && size > maxMb * 1024 * 1024) return jsonError(`Video is too large. Max is ${maxMb} MB.`);
    const title = decodeURIComponent(url.pathname.split("/").pop() || "video");
    return Response.json({ title, contentType, size, url: url.toString() });
  } catch (error) { return handleRouteError(error); }
}
