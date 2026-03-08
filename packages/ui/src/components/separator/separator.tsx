import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      role="presentation"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-secondary-200 dark:bg-secondary-700",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
);

Separator.displayName = "Separator";
