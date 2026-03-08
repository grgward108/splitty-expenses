import {
  type ButtonHTMLAttributes,
  type DialogHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type MutableRefObject,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { cn } from "../../utils/cn";

export interface DialogProps extends DialogHTMLAttributes<HTMLDialogElement> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(
  ({ className, open, onOpenChange, children, ...props }, ref) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const combinedRef = (node: HTMLDialogElement | null) => {
      dialogRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as MutableRefObject<HTMLDialogElement | null>).current = node;
      }
    };

    useEffect(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (open) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }, [open]);

    const handleBackdropClick = useCallback(
      (e: MouseEvent<HTMLDialogElement>) => {
        const dialog = dialogRef.current;
        if (dialog && e.target === dialog) {
          onOpenChange?.(false);
        }
      },
      [onOpenChange]
    );

    const handleClose = useCallback(() => {
      onOpenChange?.(false);
    }, [onOpenChange]);

    return (
      <dialog
        ref={combinedRef}
        className={cn(
          "fixed inset-0 z-50 m-auto max-h-[85vh] w-full max-w-lg rounded-lg border border-secondary-200 bg-white p-0 shadow-lg backdrop:bg-black/50 dark:border-secondary-700 dark:bg-secondary-950",
          className
        )}
        onClick={handleBackdropClick}
        onClose={handleClose}
        {...props}
      >
        {children}
      </dialog>
    );
  }
);

Dialog.displayName = "Dialog";

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6", className)} {...props} />
);

DialogContent.displayName = "DialogContent";

export interface DialogHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
  )
);

DialogHeader.displayName = "DialogHeader";

export interface DialogTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none text-secondary-900 dark:text-secondary-100",
        className
      )}
      {...props}
    />
  )
);

DialogTitle.displayName = "DialogTitle";

export interface DialogDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-secondary-500 dark:text-secondary-400", className)}
      {...props}
    />
  )
);

DialogDescription.displayName = "DialogDescription";

export interface DialogFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
);

DialogFooter.displayName = "DialogFooter";

export interface DialogCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const DialogClose = forwardRef<HTMLButtonElement, DialogCloseProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:pointer-events-none",
        className
      )}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
        role="img"
      >
        <title>Close</title>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
      <span className="sr-only">Close</span>
    </button>
  )
);

DialogClose.displayName = "DialogClose";
