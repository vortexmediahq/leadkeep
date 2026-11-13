import type { CSSProperties, ReactNode } from "react";
import { brandCssVars, type Branding } from "@/lib/branding";

export function BrandTheme({ branding, children, className }: { branding: Branding; children: ReactNode; className?: string }) {
  return (
    <div className={className} style={brandCssVars(branding) as CSSProperties}>
      {children}
    </div>
  );
}
