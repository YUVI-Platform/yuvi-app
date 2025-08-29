import React from "react";
import clsx from "clsx";

type HeadingLevels = "h1" | "h2" | "h3" | "h4";

type HeadingProps = {
  as?: HeadingLevels;
  children: React.ReactNode;
  className?: string;
};

const headingStyles: Record<HeadingLevels, string> = {
  h1: "text-4xl font-bold",
  h2: "text-3xl font-semibold",
  h3: "text-2xl font-semibold",
  h4: "text-xl font-medium",
};

export function Heading({ as: Tag = "h1", children, className }: HeadingProps) {
  return <Tag className={clsx(headingStyles[Tag], className)}>{children}</Tag>;
}
