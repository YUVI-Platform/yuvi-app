"use client";

import * as React from "react";

type Variant = "default" | "outline" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

function cn(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition active:translate-y-[0.5px] focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-60";

const variantClass: Record<Variant, string> = {
  default: "bg-black text-white hover:bg-black/90",
  outline: "border border-slate-300 bg-white hover:bg-slate-50",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  ghost: "hover:bg-slate-100",
  destructive: "bg-rose-600 text-white hover:bg-rose-700",
};

const sizeClass: Record<Size, string> = {
  sm: "text-sm px-2.5 py-1.5",
  md: "text-sm px-3 py-2",
  lg: "text-base px-4 py-2.5",
  icon: "h-9 w-9 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variantClass[variant], sizeClass[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
