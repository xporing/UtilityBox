import { ToolPage } from "@/components/tool-page";
import { QrGenerator } from "@/components/tools/qr-generator";

export default function Page() {
  return (
    <ToolPage title="QR Generator" description="Create customizable QR codes for URLs, text, Wi-Fi, contacts, email, and phone data.">
      <QrGenerator />
    </ToolPage>
  );
}
