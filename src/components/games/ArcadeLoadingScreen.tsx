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
  const progressWidth = hasProgress
    ? `${Math.min(100, Math.max(0, progress))}%`
    : undefined;

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

        <div className={`mt-6 h-2 overflow-hidden rounded-full ${isLight ? "bg-[#f0eaff]" : "bg-white/10"}`}>
          <div
            className={`h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#2563EB] ${
              hasProgress ? "transition-all duration-500" : "w-2/3 animate-pulse"
            }`}
            style={hasProgress ? { width: progressWidth } : undefined}
          />
        </div>
      </div>
    </div>
  );
}
