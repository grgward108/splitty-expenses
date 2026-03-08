import { type HTMLAttributes, type ImgHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => {
    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Avatar.displayName = "Avatar";

export interface AvatarImageProps extends ImgHTMLAttributes<HTMLImageElement> {}

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt = "", ...props }, ref) => (
    // biome-ignore lint/a11y/useAltText: alt is passed via props, default empty for decorative images
    <img
      ref={ref}
      alt={alt}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  )
);

AvatarImage.displayName = "AvatarImage";

export interface AvatarFallbackProps extends HTMLAttributes<HTMLDivElement> {}

export const AvatarFallback = forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center bg-primary-500 font-semibold text-white dark:bg-primary-600",
        className
      )}
      {...props}
    />
  )
);

AvatarFallback.displayName = "AvatarFallback";
