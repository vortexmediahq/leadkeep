import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const buttonClass = cva(
  "press inline-flex items-center justify-center gap-2 font-medium disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-ink hover:bg-ink",
        secondary: "border border-line bg-paper text-ink hover:bg-mist",
        ghost: "bg-transparent text-ink-soft hover:bg-mist",
        danger: "border border-line bg-paper text-lost hover:bg-lost-soft",
      },
      size: {
        md: "h-11 rounded-lg px-4 text-sm",
        sm: "h-10 rounded-lg px-3 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonClass> & { asChild?: boolean };

export function Button({ asChild, className, variant, size, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonClass({ variant, size }), className)}
      type={asChild ? undefined : (type ?? "button")}
      {...props}
    />
  );
}
