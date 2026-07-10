"use client";

import type { GuardianBadge, GuardianBadgeType } from "@/lib/storage";

interface StreakTrackerProps {
  streak: number;
  badges: GuardianBadge[];
}

const BADGE_INFO: Record<GuardianBadgeType, { emoji: string; label: string }> = {
  "first-log": { emoji: "🌟", label: "First Log" },
  "streak-3": { emoji: "🥉", label: "3 Days" },
  "streak-7": { emoji: "🥈", label: "7 Days" },
  "streak-14": { emoji: "🥇", label: "14 Days" },
  "graduation": { emoji: "🎓", label: "Graduate" },
};

const BADGE_ORDER: GuardianBadgeType[] = ["first-log", "streak-3", "streak-7", "streak-14", "graduation"];

export default function StreakTracker({ streak, badges }: StreakTrackerProps) {
  const earnedTypes = new Set(badges.map((b) => b.type));

  return (
    <div className="rounded-2xl border-4 border-purple-200 bg-white p-5 shadow-md">
      {/* Streak display */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={streak > 0 ? "text-6xl animate-pulse" : "text-6xl grayscale opacity-50"}
          aria-hidden="true"
        >
          🔥
        </span>
        <div className="text-center">
          <div className="text-5xl font-bold text-purple-700" aria-live="polite">
            {streak}
          </div>
          <div className="text-lg font-semibold text-purple-500">
            {streak === 1 ? "day in a row!" : "days in a row!"}
          </div>
        </div>
      </div>

      {/* Badge row */}
      <div className="mt-5">
        <h3 className="mb-3 text-center text-lg font-bold text-purple-600">Your Badges</h3>
        <div className="flex justify-center gap-3">
          {BADGE_ORDER.map((badgeType) => {
            const earned = earnedTypes.has(badgeType);
            const info = BADGE_INFO[badgeType];
            return (
              <div
                key={badgeType}
                className={[
                  "flex flex-col items-center gap-1 rounded-xl p-2 transition-all",
                  earned ? "bg-yellow-100 shadow-sm" : "bg-slate-50",
                ].join(" ")}
                aria-label={`${info.label} badge ${earned ? "earned" : "not earned yet"}`}
              >
                <span
                  className={[
                    "text-4xl transition-all",
                    earned ? "" : "grayscale opacity-30",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {info.emoji}
                </span>
                <span className={[
                  "text-xs font-semibold",
                  earned ? "text-purple-700" : "text-slate-400",
                ].join(" ")}>
                  {info.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
