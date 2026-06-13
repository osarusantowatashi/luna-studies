import { useEffect, useState } from "react";

type ArcadeLoadingScreenProps = {
  title: string;
  subtitle?: string;
  icon?: unknown;
  progress?: number;
  isLight?: boolean;
  className?: string;
};

export default function ArcadeLoadingScreen({
  title,
  subtitle,
  progress,
  isLight = false,
  className = "",
}: ArcadeLoadingScreenProps) {
  const hasProgress = typeof progress === "number";
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const progressValue = hasProgress
    ? Math.min(100, Math.max(0, progress))
    : animatedProgress;
  const progressWidth = `${progressValue}%`;

  useEffect(() => {
    if (hasProgress) return;

    setAnimatedProgress(0);

    const timer = window.setInterval(() => {
      setAnimatedProgress((current) => (current >= 100 ? 0 : Math.min(100, current + 4)));
    }, 90);

    return () => window.clearInterval(timer);
  }, [hasProgress]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-1 items-center justify-center rounded-[1.5rem] border p-5 sm:p-8 ${
        isLight
          ? "border-[#eee8ff] bg-[#faf8ff]/95"
          : "border-white/10 bg-white/[0.06] backdrop-blur-xl"
      } ${className}`}
    >
      <div className="w-full max-w-sm text-center">
        <h2 className={`text-base font-black uppercase tracking-[0.18em] ${isLight ? "text-primary" : "text-white"}`}>
          {title}
        </h2>

        {subtitle && (
          <p className={`mt-1 text-xs font-bold ${isLight ? "text-primary/55" : "text-slate-400"}`}>
            {subtitle}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          <div className={`h-4 flex-1 overflow-hidden rounded-md border ${isLight ? "border-[#eee8ff] bg-[#f0eaff]" : "border-white/10 bg-black/30"}`}>
            <div
              className="h-full rounded-sm bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] transition-all duration-150"
              style={{ width: progressWidth }}
            />
          </div>

          <span className={`w-11 text-right text-xs font-black tabular-nums ${isLight ? "text-primary/60" : "text-slate-300"}`}>
            {Math.round(progressValue)}%
          </span>
        </div>
      </div>
    </div>
  );
}
