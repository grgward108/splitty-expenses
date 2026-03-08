import { type LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: This is a reusable component; htmlFor is passed via props
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-secondary-900 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-secondary-100",
      className
    )}
    {...props}
  />
));

Label.displayName = "Label";
