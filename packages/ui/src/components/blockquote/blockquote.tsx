import { type BlockquoteHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface BlockquoteProps extends BlockquoteHTMLAttributes<HTMLQuoteElement> {}

export const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, ...props }, ref) => (
    <blockquote
      ref={ref}
      className={cn(
        "border-l-4 border-secondary-300 pl-4 italic text-secondary-700 dark:border-secondary-600 dark:text-secondary-300",
        className
      )}
      {...props}
    />
  )
);

Blockquote.displayName = "Blockquote";
