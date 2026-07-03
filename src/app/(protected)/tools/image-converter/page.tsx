import { ToolPage } from "@/components/tool-page";
import { ImageConverter } from "@/components/tools/image-converter";

export default function Page() {
  return (
    <ToolPage title="Image Converter" description="Convert images to JPG, PNG, WebP, AVIF, and supported raster formats in batches.">
      <ImageConverter />
    </ToolPage>
  );
}
