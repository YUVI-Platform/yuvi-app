"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "destructive" | "outline";
};

const variantCls: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-900 text-white",
  secondary: "bg-slate-100 text-slate-900",
  destructive: "bg-red-100 text-red-700 ring-1 ring-inset ring-red-200",
  outline: "border border-slate-200 text-slate-700",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantCls[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export default Badge;
