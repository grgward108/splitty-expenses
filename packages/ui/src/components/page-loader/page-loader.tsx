import { cn } from "../../utils/cn";

export interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export function PageLoader({
  message = "読み込み中...",
  subMessage = "少々お待ちください",
  className,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-6 min-h-[60vh] h-full w-full",
        className
      )}
    >
      <div className="relative flex items-center justify-center h-24 w-24">
        {/* Geometric morphing shape */}
        <div className="h-[80px] w-[80px] relative animate-morph bg-gradient-brand-br shadow-lg shadow-primary-500/30" />
      </div>
      <div className="flex flex-col items-center space-y-2">
        <h3 className="animate-pulse bg-gradient-brand-br bg-clip-text text-xl font-bold text-transparent">
          {message}
        </h3>
        {subMessage && (
          <p className="text-sm text-secondary-500 dark:text-secondary-400">{subMessage}</p>
        )}
      </div>
    </div>
  );
}
