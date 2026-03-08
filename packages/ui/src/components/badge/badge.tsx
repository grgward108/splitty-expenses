import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-100",
      primary: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-100",
      success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
