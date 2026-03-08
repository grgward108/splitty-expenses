import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "modern";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-white dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 shadow-sm",
      glass:
        "bg-white/70 dark:bg-secondary-900/70 backdrop-blur-xl border border-white/20 dark:border-secondary-800/20 shadow-soft",
      modern:
        "bg-white dark:bg-secondary-900 border border-transparent dark:border-secondary-700 shadow-modern",
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-2xl transition-all duration-300", variants[variant], className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";
