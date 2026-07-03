import { ToolPage } from "@/components/tool-page";
import { CprCalculator } from "@/components/tools/cpr-calculator";

export default function Page() {
  return (
    <ToolPage title="CPR Calculator" description="Calculate Cost Per Result for campaigns and compare it against your target CPR.">
      <CprCalculator />
    </ToolPage>
  );
}
