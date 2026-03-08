import { type AnchorHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "default" | "muted";
  external?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant = "default", external = false, children, ...props }, ref) => {
    const variants = {
      default:
        "text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300",
      muted:
        "text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-100",
    };

    const externalProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

    return (
      <a
        ref={ref}
        className={cn(
          "underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          variants[variant],
          className
        )}
        {...externalProps}
        {...props}
      >
        {children}
        {external && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 inline-block"
            aria-hidden="true"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" x2="21" y1="14" y2="3" />
          </svg>
        )}
      </a>
    );
  }
);

Link.displayName = "Link";
