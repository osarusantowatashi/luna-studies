import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";

type ArcadeLoadingScreenProps = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  progress?: number;
  isLight?: boolean;
  className?: string;
};

export default function ArcadeLoadingScreen({
  title,
  subtitle,
  icon: Icon = Sparkles,
  progress,
  isLight = false,
  className = "",
}: ArcadeLoadingScreenProps) {
  const hasProgress = typeof progress === "number";
  const progressValue = hasProgress ? Math.min(100, Math.max(0, progress)) : 100;
  const progressWidth = `${progressValue}%`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-1 items-center justify-center rounded-[1.5rem] border p-6 sm:p-10 ${
        isLight
          ? "border-[#eee8ff] bg-[#faf8ff]/95"
          : "border-white/10 bg-white/[0.06] backdrop-blur-xl"
      } ${className}`}
    >
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#8B5CF6]/35 bg-[#8B5CF6]/15 shadow-[0_18px_48px_rgba(139,92,246,0.22)]">
          <Icon className="h-8 w-8 text-[#C4B5FD]" />
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-[#C4B5FD]">
          Luna Arcade
        </p>

        <h2 className={`mt-3 text-3xl font-black ${isLight ? "text-primary" : "text-white"}`}>
          {title}
        </h2>

        {subtitle && (
          <p className={`mt-2 text-sm font-bold ${isLight ? "text-primary/60" : "text-slate-300"}`}>
            {subtitle}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className={`h-3 flex-1 overflow-hidden rounded-full border ${isLight ? "border-[#eee8ff] bg-[#f0eaff]" : "border-white/10 bg-black/25"}`}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#22D3EE] transition-all duration-500"
              style={{ width: progressWidth }}
            />
          </div>

          <span className={`w-11 text-right text-xs font-black tabular-nums ${isLight ? "text-primary/60" : "text-slate-300"}`}>
            {Math.round(progressValue)}%
          </span>
        </div>

        {!hasProgress && (
          <div className={`mt-2 h-1 overflow-hidden rounded-full ${isLight ? "bg-[#f0eaff]" : "bg-white/10"}`}>
          <div
            className="h-full w-2/3 animate-pulse rounded-full bg-white/40"
          />
        </div>
        )}
      </div>
    </div>
  );
}
