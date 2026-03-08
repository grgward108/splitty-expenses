import { type ElementType, type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "default" | "muted" | "primary" | "error";
  as?: ElementType;
}

export const Text = forwardRef<HTMLParagraphElement, TextProps>(
  (
    {
      className,
      size = "md",
      weight = "normal",
      color = "default",
      as: Component = "p",
      children,
      ...props
    },
    ref
  ) => {
    const sizes = {
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    };

    const weights = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    };

    const colors = {
      default: "text-secondary-900 dark:text-secondary-100",
      muted: "text-secondary-500 dark:text-secondary-400",
      primary: "text-primary-600 dark:text-primary-400",
      error: "text-red-600 dark:text-red-400",
    };

    return (
      <Component
        ref={ref}
        className={cn(sizes[size], weights[weight], colors[color], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = "Text";
