import { publicLogoUrl } from "@/lib/data";
import { cn } from "@/lib/utils";

/** Client logo, never stretched. Sit it in a fixed-height box and let the image keep its shape. */
export function BrandMark({
  path,
  name,
  className,
  heightClass = "h-12",
}: {
  path: string;
  name: string;
  className?: string;
  heightClass?: string;
}) {
  const src = publicLogoUrl(path);
  if (!src) return null;
  return (
    <div className={cn("flex max-w-full items-center justify-start", className)}>
      <img src={src} alt={name ? `${name} logo` : "Business logo"} className={cn(heightClass, "w-auto max-w-full object-contain")} />
    </div>
  );
}
