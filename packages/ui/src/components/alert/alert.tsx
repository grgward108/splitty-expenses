import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", ...props }, ref) => {
    const variants = {
      info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
      success:
        "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
      warning:
        "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100",
      error:
        "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn("relative w-full rounded-lg border p-4", variants[variant], className)}
        {...props}
      />
    );
  }
);

Alert.displayName = "Alert";

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn("mb-1 font-medium leading-none", className)} {...props} />
  )
);

AlertTitle.displayName = "AlertTitle";

export interface AlertDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
  )
);

AlertDescription.displayName = "AlertDescription";
