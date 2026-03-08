import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface CodeProps extends HTMLAttributes<HTMLElement> {}

export const Code = forwardRef<HTMLElement, CodeProps>(({ className, ...props }, ref) => (
  <code
    ref={ref}
    className={cn(
      "relative rounded bg-secondary-100 px-[0.3rem] py-[0.2rem] font-mono text-sm text-secondary-900 dark:bg-secondary-800 dark:text-secondary-100",
      className
    )}
    {...props}
  />
));

Code.displayName = "Code";
