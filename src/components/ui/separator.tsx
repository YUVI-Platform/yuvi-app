"use client";

import * as React from "react";

type SeparatorProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  orientation = "horizontal",
  className,
  ...props
}: SeparatorProps) {
  const base = "bg-slate-200 dark:bg-slate-800 shrink-0";
  const size = orientation === "vertical" ? "w-px h-full" : "h-px w-full";

  return (
    <div
      role="separator"
      className={`${base} ${size} ${className ?? ""}`}
      {...props}
    />
  );
}
