import { ToolPage } from "@/components/tool-page";
import { HtmlViewer } from "@/components/tools/html-viewer";

export default function Page() {
  return (
    <ToolPage title="HTML Viewer" description="Paste HTML and preview it inside a sandboxed iframe with optional CSS and JS.">
      <HtmlViewer />
    </ToolPage>
  );
}
