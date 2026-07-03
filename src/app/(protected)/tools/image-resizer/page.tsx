import { ToolPage } from "@/components/tool-page";
import { ImageResizer } from "@/components/tools/image-resizer";

export default function Page() {
  return (
    <ToolPage title="Image Resizer" description="Resize images by custom dimensions, percentage, or social media presets.">
      <ImageResizer />
    </ToolPage>
  );
}
