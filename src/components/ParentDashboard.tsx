"use client";

import { useEffect, useState } from "react";
import type { GuardianLog, GuardianBadge, KidProfile } from "@/lib/storage";
import {
  getAllGuardianLogs,
  getAllGuardianBadges,
  getKidProfile,
  getLongestStreak,
  calculateStreak,
} from "@/lib/storage";

interface ParentDashboardProps {
  onClose?: () => void;
}

export default function ParentDashboard({ onClose }: ParentDashboardProps) {
  const [kidProfile, setKidProfile] = useState<KidProfile | null>(null);
  const [logs, setLogs] = useState<GuardianLog[]>([]);
  const [badges, setBadges] = useState<GuardianBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [profile, allLogs, allBadges] = await Promise.all([
          getKidProfile("default"),
          getAllGuardianLogs(),
          getAllGuardianBadges(),
        ]);
        if (cancelled) return;
        setKidProfile(profile ?? null);
        setLogs(allLogs);
        setBadges(allBadges);
      } catch (err) {
        console.error("ParentDashboard load error:", err);
        if (!cancelled) setError("Could not load guardian data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <span className="text-4xl animate-pulse" aria-hidden="true">🐾</span>
          <p className="mt-2 text-slate-500">Loading guardian data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <span className="text-4xl" aria-hidden="true">⚠️</span>
        <p className="mt-2 text-slate-700">{error}</p>
      </div>
    );
  }

  if (!kidProfile) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <span className="text-4xl" aria-hidden="true">👶</span>
        <p className="mt-2 font-semibold text-amber-800">No child profile set up yet</p>
        <p className="mt-1 text-sm text-amber-600">
          Set up your child&apos;s access in Settings to get started.
        </p>
      </div>
    );
  }

  const currentStreak = calculateStreak(logs);
  const longestStreak = getLongestStreak(logs);
  const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const completedDays = logs.filter((l) => l.checklistComplete).length;

  const BADGE_LABELS: Record<string, string> = {
    "first-log": "🌟 First Log",
    "streak-3": "🥉 3-Day Streak",
    "streak-7": "🥈 7-Day Streak",
    "streak-14": "🥇 14-Day Streak",
    "graduation": "🎓 Graduation",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">🧒</span>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{kidProfile.childName}&apos;s Dashboard</h2>
            <p className="text-sm text-slate-500">
              Guardian progress · {completedDays} day{completedDays !== 1 ? "s" : ""} completed
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-3 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Close dashboard"
          >
            ← Back to Settings
          </button>
        )}
      </div>

      {/* Streak stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Current Streak</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">
            {currentStreak} 🔥
          </p>
          <p className="text-xs text-slate-500">day{currentStreak !== 1 ? "s" : ""} in a row</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Longest Streak</p>
          <p className="mt-1 text-3xl font-bold text-amber-600">
            {longestStreak} 🏆
          </p>
          <p className="text-xs text-slate-500">personal best</p>
        </div>
      </div>

      {/* Milestone progress */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase text-slate-400">Milestone Progress</p>
        <div className="flex items-center gap-2">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all"
              style={{ width: `${Math.min(100, (completedDays / 14) * 100)}%` }}
              role="progressbar"
              aria-valuenow={completedDays}
              aria-valuemin={0}
              aria-valuemax={14}
              aria-label="Days completed out of 14"
            />
          </div>
          <span className="text-sm font-bold text-amber-600">{completedDays}/14</span>
        </div>
      </div>

      {/* Badges earned */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase text-slate-400">Badges Earned</p>
        {badges.length === 0 ? (
          <p className="text-sm text-slate-400">No badges earned yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span
                key={badge.id}
                className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800"
              >
                {BADGE_LABELS[badge.type] ?? badge.type}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Log history */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase text-slate-400">Log History</p>
        {sortedLogs.length === 0 ? (
          <p className="text-sm text-slate-400">No logs recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {sortedLogs.slice(0, 20).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(log.date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {log.checklistComplete ? "All tasks completed" : "Partial"}
                    {` · Streak: ${log.streakAtLog}`}
                  </p>
                  <div className="mt-1 flex gap-1">
                    <LogIcon done={log.items.floor} emoji="🧸" label="Toys" />
                    <LogIcon done={log.items.cords} emoji="🔌" label="Cords" />
                    <LogIcon done={log.items.smallObjects} emoji="📏" label="Small things" />
                    <LogIcon done={log.items.foodSweep} emoji="🍎" label="Food" />
                  </div>
                </div>
                <span className="text-lg" aria-hidden="true">
                  {log.checklistComplete ? "✅" : "⏳"}
                </span>
              </div>
            ))}
            {sortedLogs.length > 20 && (
              <p className="text-center text-xs text-slate-400">
                Showing 20 most recent of {sortedLogs.length} total logs
              </p>
            )}
          </div>
        )}
      </div>

      {/* Note */}
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-slate-700">
          💡 <strong>Note:</strong> This is an observation-only view. No approvals needed — your child
          logs independently and builds responsibility at their own pace.
        </p>
      </div>
    </div>
  );
}

function LogIcon({ done, emoji, label }: { done: boolean; emoji: string; label: string }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs",
        done ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-400",
      ].join(" ")}
      aria-label={`${label}: ${done ? "done" : "not done"}`}
    >
      {emoji} {done ? "✓" : "✗"}
    </span>
  );
}
