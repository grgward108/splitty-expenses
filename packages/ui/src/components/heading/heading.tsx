import { type ElementType, type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  as?: ElementType;
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, as, children, ...props }, ref) => {
    const Component = as || (`h${level}` as ElementType);

    const levels = {
      1: "text-4xl font-extrabold tracking-tight",
      2: "text-3xl font-bold tracking-tight",
      3: "text-2xl font-bold",
      4: "text-xl font-bold",
      5: "text-lg font-semibold",
      6: "text-base font-semibold",
    };

    return (
      <Component
        ref={ref}
        className={cn("text-secondary-900 dark:text-secondary-100", levels[level], className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = "Heading";
