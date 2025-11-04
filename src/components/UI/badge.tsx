"use client";

import * as React from "react";

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
};

const map: Record<Variant, string> = {
  default: "bg-slate-900 text-white ring-slate-900/10",
  secondary: "bg-slate-100 text-slate-900 ring-slate-200",
  outline: "bg-white text-slate-700 ring-slate-300",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  destructive: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function Badge({
  className,
  variant = "secondary",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1 ring-inset ${
        map[variant]
      } ${className ?? ""}`}
      {...props}
    />
  );
}

export default Badge;
