import { ToolPage } from "@/components/tool-page";
import { PasswordGenerator } from "@/components/tools/password-generator";

export default function Page() {
  return (
    <ToolPage title="Password Generator" description="Generate secure passwords entirely in your browser using the Web Crypto API.">
      <PasswordGenerator />
    </ToolPage>
  );
}
