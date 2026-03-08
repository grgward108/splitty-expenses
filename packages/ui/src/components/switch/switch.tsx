import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../utils/cn";

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: {
    track: "h-6 w-10",
    thumb: "h-5 w-5",
    translate: "translate-x-4",
  },
  md: {
    track: "h-8 w-14",
    thumb: "h-7 w-7",
    translate: "translate-x-6",
  },
  lg: {
    track: "h-10 w-18",
    thumb: "h-9 w-9",
    translate: "translate-x-8",
  },
};

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { className, checked = false, onCheckedChange, label, size = "md", id, disabled, ...props },
    ref
  ) => {
    const switchId = id || `switch-${Math.random().toString(36).slice(2, 9)}`;
    const sizeClass = sizeClasses[size];

    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          id={switchId}
          ref={ref}
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={handleClick}
          className={cn(
            "relative inline-flex items-center shrink-0 cursor-pointer rounded-full",
            "border-2 border-transparent transition-colors duration-200 ease-in-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            sizeClass.track,
            checked ? "bg-primary-600" : "bg-secondary-200 dark:bg-secondary-700",
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "pointer-events-none inline-block transform rounded-full",
              "bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
              sizeClass.thumb,
              checked ? sizeClass.translate : "translate-x-1"
            )}
          />
        </button>
        {label && (
          <label
            htmlFor={switchId}
            className={cn(
              "text-sm font-medium leading-none text-secondary-900 dark:text-secondary-100",
              disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";
