import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../../utils/cn";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
  triggerId: string;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error("DropdownMenu components must be used within DropdownMenu");
  return ctx;
}

export interface DropdownMenuProps extends HTMLAttributes<HTMLDivElement> {}

export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ className, children, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const contentId = `dropdown-content-${Math.random().toString(36).slice(2, 9)}`;
    const triggerId = `dropdown-trigger-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <DropdownMenuContext.Provider value={{ open, setOpen, contentId, triggerId }}>
        <div ref={ref} className={cn("relative inline-block", className)} {...props}>
          {children}
        </div>
      </DropdownMenuContext.Provider>
    );
  }
);

DropdownMenu.displayName = "DropdownMenu";

export interface DropdownMenuTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DropdownMenuTrigger = forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  ({ className, id, onClick, children, asChild, ...props }, ref) => {
    const { open, setOpen, contentId, triggerId } = useDropdownMenu();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      setOpen(!open);
      onClick?.(e);
    };

    if (asChild && isValidElement(children)) {
      const mergedProps = {
        id: id ?? triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        "aria-controls": contentId,
        onClick: (e: React.MouseEvent) => {
          handleClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
          (
            children as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>
          ).props?.onClick?.(e);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
          }
          (
            children as React.ReactElement<{ onKeyDown?: (e: React.KeyboardEvent) => void }>
          ).props?.onKeyDown?.(e);
        },
        ref,
        role: "button",
        tabIndex: 0,
      };
      return cloneElement(
        children as React.ReactElement<Record<string, unknown>>,
        mergedProps as Record<string, unknown>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        id={id ?? triggerId}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={contentId}
        className={cn(
          "inline-flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end" | "center";
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, id, align = "end", children, ...props }, ref) => {
    const { open, setOpen, contentId, triggerId } = useDropdownMenu();
    const contentRef = useRef<HTMLDivElement | null>(null);

    const handleClickOutside = useCallback(
      (e: MouseEvent) => {
        const target = e.target as Node;
        const content = contentRef.current;
        const trigger = document.getElementById(triggerId);
        if (content && !content.contains(target) && trigger && !trigger.contains(target)) {
          setOpen(false);
        }
      },
      [setOpen, triggerId]
    );

    const handleEscape = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      },
      [setOpen]
    );

    useEffect(() => {
      if (!open) return;
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [open, handleClickOutside, handleEscape]);

    const combinedRef = (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    if (!open) return null;

    const alignClasses = {
      start: "left-0",
      end: "right-0",
      center: "left-1/2 -translate-x-1/2",
    };

    return (
      <div
        ref={combinedRef}
        id={id ?? contentId}
        role="menu"
        aria-orientation="vertical"
        className={cn(
          "absolute z-50 mt-2 min-w-[10rem] rounded-lg border border-secondary-200 bg-white py-1 shadow-lg dark:border-secondary-700 dark:bg-secondary-900",
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, onClick, asChild, children, ...props }, ref) => {
    const { setOpen } = useDropdownMenu();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      setOpen(false);
    };

    if (asChild && typeof children === "object" && children !== null && "props" in children) {
      const child = children as React.ReactElement;
      return (
        <div
          role="menuitem"
          tabIndex={0}
          className={cn(
            "block w-full text-left px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800 cursor-pointer outline-none focus-visible:bg-secondary-100 focus-visible:dark:bg-secondary-800",
            className
          )}
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(false);
            }
          }}
        >
          {child}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        className={cn(
          "w-full px-3 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800 outline-none focus-visible:bg-secondary-100 focus-visible:dark:bg-secondary-800 rounded-md",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);

DropdownMenuItem.displayName = "DropdownMenuItem";

export interface DropdownMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("my-1 h-px bg-secondary-200 dark:bg-secondary-700", className)}
      {...props}
    />
  )
);

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";
