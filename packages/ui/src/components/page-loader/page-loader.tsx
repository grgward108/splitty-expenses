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
        <div
          className="w-[80px] h-[80px] relative animate-morph shadow-lg shadow-primary-500/30"
          style={{
            background: "linear-gradient(135deg, #93C5FD, #2563EB)",
          }}
        />
      </div>
      <div className="flex flex-col items-center space-y-2">
        <h3
          className="text-xl font-bold bg-clip-text text-transparent animate-pulse"
          style={{
            backgroundImage: "linear-gradient(to bottom right, #60A5FA, #3EA8FF)",
          }}
        >
          {message}
        </h3>
        {subMessage && (
          <p className="text-sm text-secondary-500 dark:text-secondary-400">{subMessage}</p>
        )}
      </div>
    </div>
  );
}
