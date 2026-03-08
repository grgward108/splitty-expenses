import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "gradient" | "glass";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 rounded-xl active:scale-[0.98] hover:-translate-y-0.5 disabled:translate-y-0";

    const variants = {
      primary:
        "bg-primary-500 text-white hover:bg-primary-600 shadow-soft shadow-primary-500/15 focus-visible:ring-primary-500",
      secondary:
        "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus-visible:ring-secondary-400 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700",
      outline:
        "border border-secondary-200 bg-transparent text-secondary-900 hover:bg-secondary-50 dark:border-secondary-600 dark:text-secondary-100 dark:hover:bg-secondary-800 focus-visible:ring-primary-500",
      ghost: "hover:bg-secondary-100 dark:hover:bg-secondary-800 focus-visible:ring-secondary-400",
      destructive:
        "bg-danger-500 text-white hover:bg-danger-600 shadow-soft shadow-danger-500/15 focus-visible:ring-danger-500",
      gradient:
        "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-card shadow-primary-500/20 focus-visible:ring-primary-500",
      glass:
        "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 focus-visible:ring-white/30",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="img"
          >
            <title>Loading</title>
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
