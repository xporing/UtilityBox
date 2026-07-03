import { handleRouteError, jsonError, requireApiUser } from "@/lib/api";
import { logToolUsage } from "@/lib/files";
import { isDownloadableVideoType, validateLegalDirectMediaUrl } from "@/lib/video-url";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser();
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("url");
    if (!raw) return jsonError("Missing URL.");
    const url = await validateLegalDirectMediaUrl(raw);
    const response = await fetch(url, { redirect: "manual" });
    if (response.status >= 300 && response.status < 400) return jsonError("Redirects are blocked. Use the final direct media URL.");
    const contentType = response.headers.get("content-type");
    if (!response.ok || !isDownloadableVideoType(contentType)) return jsonError("This URL is not a supported direct video file.");
    const size = Number(response.headers.get("content-length") || 0) || undefined;
    await logToolUsage({ userId: user.id, toolName: "Video Downloader", action: "direct-media-download", fileSize: size });
    const filename = decodeURIComponent(url.pathname.split("/").pop() || "video.mp4").replace(/["\\]/g, "");
    return new Response(response.body, { headers: { "content-type": contentType || "application/octet-stream", "content-disposition": `attachment; filename="${filename}"` } });
  } catch (error) { return handleRouteError(error); }
}
