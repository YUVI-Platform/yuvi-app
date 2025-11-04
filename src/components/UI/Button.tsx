"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

const base =
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-black text-white hover:bg-black/90",
  secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
  outline: "border border-slate-200 bg-white hover:bg-slate-50",
  ghost: "hover:bg-slate-100",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  link: "text-black underline-offset-4 hover:underline bg-transparent",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3",
  lg: "h-10 px-6",
  icon: "h-9 w-9 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export default Button;
