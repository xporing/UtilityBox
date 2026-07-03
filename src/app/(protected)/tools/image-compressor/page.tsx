import { ToolPage } from "@/components/tool-page";
import { ImageCompressor } from "@/components/tools/image-compressor";

export default function Page() {
  return (
    <ToolPage title="Image Compressor" description="Compress images with quality controls and batch ZIP downloads.">
      <ImageCompressor />
    </ToolPage>
  );
}
