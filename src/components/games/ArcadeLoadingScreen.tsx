import { useEffect, useState } from "react";

type ArcadeLoadingScreenProps = {
  title?: string;
  subtitle?: string;
  progress?: number;
  isLight?: boolean;
  className?: string;
};

export default function ArcadeLoadingScreen({
  title = "Loading",
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

  useEffect(() => {
    if (hasProgress) return;

    setAnimatedProgress(0);

    const timer = window.setInterval(() => {
      setAnimatedProgress((current) => {
        if (current >= 96) return 96;
        return Math.min(96, current + Math.ceil((100 - current) * 0.08));
      });
    }, 80);

    return () => window.clearInterval(timer);
  }, [hasProgress]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-1 items-center justify-center rounded-[1.25rem] border p-4 sm:rounded-[1.5rem] sm:p-6 ${
        isLight
          ? "border-[#eee8ff] bg-[#faf8ff]/95"
          : "border-white/10 bg-[#071426]/95 backdrop-blur-xl"
      } ${className}`}
    >
      <div className="w-full max-w-md rounded-[1.25rem] border border-[#22D3EE]/45 bg-[#24194A] p-4 text-center shadow-[0_0_35px_rgba(34,211,238,0.18)] sm:rounded-[1.5rem] sm:p-6">
        <p className="text-base font-black uppercase tracking-[0.16em] text-[#22D3EE] drop-shadow-[0_0_10px_rgba(34,211,238,0.65)] sm:text-xl sm:tracking-[0.18em]">
          {title}
        </p>

        {subtitle && (
          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#C4B5FD] sm:text-xs sm:tracking-[0.14em]">
            {subtitle}
          </p>
        )}

        <div className="mt-5 rounded-xl border-4 border-[#22D3EE] bg-[#2D2944] p-1 shadow-[0_0_18px_rgba(34,211,238,0.5)]">
          <div className="h-6 overflow-hidden rounded-md bg-[#3A374B] sm:h-8">
            <div
              className="h-full rounded-md bg-[repeating-linear-gradient(135deg,#22D3EE_0px,#22D3EE_12px,transparent_12px,transparent_22px)] transition-all duration-150"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        <p className="mt-5 text-3xl font-black tabular-nums text-[#22D3EE] drop-shadow-[0_0_10px_rgba(34,211,238,0.65)] sm:text-4xl">
          {Math.round(progressValue)}%
        </p>
      </div>
    </div>
  );
}
