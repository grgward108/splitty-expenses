import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("animate-pulse rounded-md bg-secondary-200 dark:bg-secondary-700", className)}
      {...props}
    />
  )
);

Skeleton.displayName = "Skeleton";
