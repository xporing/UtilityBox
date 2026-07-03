import { Boxes } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold tracking-tight">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Boxes className="h-5 w-5" />
      </div>
      <span>UtilityBox</span>
    </div>
  );
}
