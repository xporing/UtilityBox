import { ToolPage } from "@/components/tool-page";
import { VideoToAudio } from "@/components/tools/video-to-audio";

export default function Page() {
  return (
    <ToolPage title="Video to Audio" description="Extract MP3, WAV, or M4A audio from uploaded video files.">
      <VideoToAudio />
    </ToolPage>
  );
}
