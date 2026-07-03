import { ToolPage } from "@/components/tool-page";
import { VideoDownloader } from "@/components/tools/video-downloader";

export default function Page() {
  return (
    <ToolPage title="Video Downloader" description="Download supported legal direct media URLs only. No DRM, paywall, login, or copyright bypass.">
      <VideoDownloader />
    </ToolPage>
  );
}
