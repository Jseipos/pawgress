"use client";

import { useState, useEffect, useMemo } from "react";
import type { TrainingSession } from "@/lib/storage";
import { getAllSessions } from "@/lib/storage";

interface ConsistencyTrackerProps {
  refreshKey: number;
}

type Range = "week" | "month" | "all";

export default function ConsistencyTracker({ refreshKey }: ConsistencyTrackerProps) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [range, setRange] = useState<Range>("month");

  useEffect(() => {
    (async () => {
      const all = await getAllSessions();
      setSessions(all);
    })();
  }, [refreshKey]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const dates = new Set(sessions.map((s) => s.date.split("T")[0]));

    // Current streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (dates.has(dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Longest streak
    const sortedDates = Array.from(dates).sort();
    let longestStreak = 0;
    let tempStreak = 0;
    let prevDate: string | null = null;
    for (const dateStr of sortedDates) {
      if (prevDate) {
        const prev = new Date(prevDate);
        const curr = new Date(dateStr);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = dateStr;
    }

    return { total, currentStreak, longestStreak };
  }, [sessions]);

  // Build heatmap data
  const heatmapData = useMemo(() => {
    const today = new Date();
    let weeks: number;
    if (range === "week") weeks = 2;
    else if (range === "month") weeks = 6;
    else weeks = 26;

    const days: { date: string; count: number; isToday: boolean }[] = [];
    const totalDays = weeks * 7;
    const startOffset = today.getDay(); // 0 = Sunday

    for (let i = totalDays - 1 - startOffset; i >= -startOffset; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = sessions.filter((s) => s.date.startsWith(dateStr)).length;
      days.push({
        date: dateStr,
        count,
        isToday: dateStr === today.toISOString().split("T")[0],
      });
    }

    // Reshape into weeks (columns) x days (rows)
    const weeksGrid: { date: string; count: number; isToday: boolean }[][] = [];
    for (let w = 0; w < weeks; w++) {
      const week: { date: string; count: number; isToday: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const idx = w * 7 + d;
        week.push(days[idx] ?? { date: "", count: 0, isToday: false });
      }
      weeksGrid.push(week);
    }

    return weeksGrid;
  }, [sessions, range]);

  const milestones = [
    { count: 10, emoji: "🌱", label: "10 sessions" },
    { count: 25, emoji: "🌿", label: "25 sessions" },
    { count: 50, emoji: "🌳", label: "50 sessions" },
    { count: 100, emoji: "🏆", label: "100 sessions" },
  ];

  const nextMilestone = milestones.find((m) => m.count > stats.total);

  function getHeatmapColor(count: number): string {
    if (count === 0) return "bg-slate-100";
    if (count === 1) return "bg-amber-200";
    if (count === 2) return "bg-amber-300";
    if (count === 3) return "bg-amber-400";
    return "bg-amber-600";
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Training Consistency</h3>
        <div className="flex gap-1">
          {(["week", "month", "all"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={[
                "rounded-md px-2 py-0.5 text-xs font-semibold capitalize transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                range === r ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-xl font-bold text-amber-600">{stats.total}</p>
          <p className="text-xs text-slate-400">Total</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-amber-600">{stats.currentStreak}</p>
          <p className="text-xs text-slate-400">Current streak</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-amber-600">{stats.longestStreak}</p>
          <p className="text-xs text-slate-400">Longest</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="flex gap-1" role="img" aria-label="Training activity heatmap">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1" aria-hidden="true">
            {["", "M", "", "W", "", "F", ""].map((day, i) => (
              <div key={i} className="h-3 w-3 text-[8px] text-slate-400 flex items-center">{day}</div>
            ))}
          </div>
          {/* Weeks */}
          {heatmapData.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={[
                    "h-3 w-3 rounded-sm transition-all",
                    getHeatmapColor(day.count),
                    day.isToday ? "ring-1 ring-amber-700 ring-offset-1" : "",
                  ].join(" ")}
                  title={day.date ? `${day.date}: ${day.count} session${day.count !== 1 ? "s" : ""}` : ""}
                  aria-label={day.date ? `${day.date}: ${day.count} sessions` : "No date"}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-end gap-1 text-xs text-slate-400">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-slate-100" />
        <div className="h-3 w-3 rounded-sm bg-amber-200" />
        <div className="h-3 w-3 rounded-sm bg-amber-300" />
        <div className="h-3 w-3 rounded-sm bg-amber-400" />
        <div className="h-3 w-3 rounded-sm bg-amber-600" />
        <span>More</span>
      </div>

      {/* Milestones */}
      <div className="mt-3 border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between">
          {milestones.map((m) => {
            const earned = stats.total >= m.count;
            return (
              <div key={m.count} className="flex flex-col items-center" title={m.label}>
                <span className={`text-xl ${earned ? "" : "opacity-30 grayscale"}`} aria-hidden="true">
                  {m.emoji}
                </span>
                <span className={`text-[8px] font-semibold ${earned ? "text-amber-600" : "text-slate-300"}`}>
                  {m.count}
                </span>
              </div>
            );
          })}
        </div>
        {nextMilestone && stats.total > 0 && (
          <p className="mt-2 text-center text-xs text-slate-500">
            {nextMilestone.count - stats.total} more session{nextMilestone.count - stats.total !== 1 ? "s" : ""} to {nextMilestone.emoji} {nextMilestone.label}
          </p>
        )}
      </div>

      {/* Reflection prompt every 10 sessions */}
      {stats.total > 0 && stats.total % 10 === 0 && (
        <div className="mt-3 rounded-lg border-2 border-amber-200 bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-800">
            💭 You&apos;ve trained {stats.total} times! How&apos;s your bond growing?
          </p>
        </div>
      )}
    </div>
  );
}
