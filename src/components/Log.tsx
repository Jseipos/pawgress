"use client";

import { useState, useEffect, useMemo } from "react";
import type { TrainingSession } from "@/lib/storage";
import { getAllSessions } from "@/lib/storage";
import { SKILLS_BY_ID, TRACK_INFO, type TrackId } from "@/lib/skills";

interface LogProps {
  refreshKey: number;
}

type GroupBy = "week" | "month" | "skill";
type DateRange = "week" | "month" | "all";

export default function Log({ refreshKey }: LogProps) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [skillFilter, setSkillFilter] = useState<string>("all");
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [breakthroughOnly, setBreakthroughOnly] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>("week");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const all = await getAllSessions();
      setSessions(all);
      setLoading(false);
    })();
  }, [refreshKey]);

  // Get unique skill IDs and tracks from sessions
  const skillOptions = useMemo(() => {
    const ids = new Set(sessions.map((s) => s.skillId));
    return Array.from(ids).map((id) => ({
      id,
      name: SKILLS_BY_ID[id]?.name ?? id,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [sessions]);

  // Filter sessions
  const filtered = useMemo(() => {
    let result = [...sessions];

    if (skillFilter !== "all") {
      result = result.filter((s) => s.skillId === skillFilter);
    }

    if (trackFilter !== "all") {
      const track = trackFilter as TrackId;
      const trackSkillIds = new Set(
        Object.entries(SKILLS_BY_ID)
          .filter(([, s]) => s.track === track)
          .map(([id]) => id)
      );
      result = result.filter((s) => trackSkillIds.has(s.skillId));
    }

    if (dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (dateRange === "week") cutoff.setDate(now.getDate() - 7);
      else if (dateRange === "month") cutoff.setMonth(now.getMonth() - 1);
      result = result.filter((s) => new Date(s.date) >= cutoff);
    }

    if (breakthroughOnly) {
      result = result.filter((s) => s.breakthrough);
    }

    return result;
  }, [sessions, skillFilter, trackFilter, dateRange, breakthroughOnly]);

  // Stats
  const stats = useMemo(() => {
    const total = filtered.length;
    const avgPuppy = total > 0 ? (filtered.reduce((sum, s) => sum + s.puppyPerformance, 0) / total).toFixed(1) : "—";
    const avgTrainer = total > 0 ? (filtered.reduce((sum, s) => sum + s.trainerPerformance, 0) / total).toFixed(1) : "—";
    const breakthroughs = filtered.filter((s) => s.breakthrough).length;

    // Current streak (consecutive days with at least one session)
    const dates = new Set(sessions.map((s) => s.date.split("T")[0]));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (dates.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    return { total, avgPuppy, avgTrainer, breakthroughs, streak };
  }, [filtered, sessions]);

  // Group sessions
  const grouped = useMemo(() => {
    const groups: Record<string, TrainingSession[]> = {};

    for (const session of filtered) {
      let key: string;
      if (groupBy === "week") {
        const d = new Date(session.date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } else if (groupBy === "month") {
        const d = new Date(session.date);
        key = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      } else {
        key = SKILLS_BY_ID[session.skillId]?.name ?? session.skillId;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    }

    return Object.entries(groups).sort((a, b) => {
      if (groupBy === "skill") return a[0].localeCompare(b[0]);
      return b[0].localeCompare(a[0]);
    });
  }, [filtered, groupBy]);

  // Performance chart data per skill
  const chartData = useMemo(() => {
    const bySkill: Record<string, TrainingSession[]> = {};
    for (const s of filtered) {
      if (!bySkill[s.skillId]) bySkill[s.skillId] = [];
      bySkill[s.skillId].push(s);
    }
    return bySkill;
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-amber-50 to-slate-100">
        <p className="text-slate-500">Loading sessions...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-slate-100 px-6 py-16">
        <span className="text-5xl" aria-hidden="true">📋</span>
        <h2 className="mt-3 text-xl font-bold text-slate-900">No sessions yet</h2>
        <p className="mt-1 text-sm text-slate-500">Start training on the Train tab!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50 to-slate-100">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {/* Stats Summary */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          <StatCard label="Sessions" value={stats.total.toString()} />
          <StatCard label="Streak" value={`${stats.streak}d`} />
          <StatCard label="Avg Puppy" value={stats.avgPuppy} />
          <StatCard label="💡 Wins" value={stats.breakthroughs.toString()} />
        </div>

        {/* Performance Chart */}
        {Object.keys(chartData).length > 0 && (
          <PerformanceChart chartData={chartData} />
        )}

        {/* Filter Bar */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-amber-500 focus:outline-none"
              aria-label="Filter by skill"
            >
              <option value="all">All Skills</option>
              {skillOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-amber-500 focus:outline-none"
              aria-label="Filter by track"
            >
              <option value="all">All Tracks</option>
              {(Object.keys(TRACK_INFO) as TrackId[]).map((t) => (
                <option key={t} value={t}>{TRACK_INFO[t].emoji} {TRACK_INFO[t].name}</option>
              ))}
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-amber-500 focus:outline-none"
              aria-label="Filter by date range"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>

            <button
              onClick={() => setBreakthroughOnly(!breakthroughOnly)}
              aria-pressed={breakthroughOnly}
              className={[
                "rounded-lg border-2 px-3 py-1.5 text-sm font-semibold transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                breakthroughOnly
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-600",
              ].join(" ")}
            >
              💡 Only
            </button>
          </div>

          {/* Group by toggle */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Group by:</span>
            {(["week", "month", "skill"] as GroupBy[]).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                aria-pressed={groupBy === g}
                className={[
                  "rounded-md px-2 py-0.5 text-xs font-semibold capitalize transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                  groupBy === g ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Session Groups */}
        {grouped.length === 0 ? (
          <div className="rounded-xl border-2 border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">No sessions match these filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([groupKey, groupSessions]) => (
              <div key={groupKey}>
                <h3 className="mb-2 text-sm font-bold uppercase text-slate-400">
                  {groupKey} <span className="text-slate-300">({groupSessions.length})</span>
                </h3>
                <div className="space-y-2">
                  {groupSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      expanded={expandedId === session.id}
                      onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-center shadow-sm">
      <p className="text-lg font-bold text-amber-600">{value}</p>
      <p className="text-xs font-semibold uppercase text-slate-400">{label}</p>
    </div>
  );
}

// ─── Session Card ──────────────────────────────────────────────────────────────

function SessionCard({
  session,
  expanded,
  onToggle,
}: {
  session: TrainingSession;
  expanded: boolean;
  onToggle: () => void;
}) {
  const skill = SKILLS_BY_ID[session.skillId];
  const date = new Date(session.date);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <button
      onClick={onToggle}
      aria-expanded={expanded}
      className={[
        "w-full rounded-xl border-2 bg-white p-4 text-left shadow-sm transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
        session.breakthrough ? "border-amber-300" : "border-slate-200",
        expanded ? "shadow-md" : "hover:shadow-md",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">
            {skill ? TRACK_INFO[skill.track].emoji : "🦴"}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-900">{session.skillName}</p>
              {session.breakthrough && <span className="text-sm" aria-label="Breakthrough">💡</span>}
            </div>
            <p className="text-xs text-slate-500">
              {dateStr} · {timeStr} · {session.durationMin}min · {session.location}
            </p>
          </div>
        </div>
      </div>

      {/* Rating bars */}
      <div className="mt-3 flex items-center gap-4">
        <RatingBar label="🐶" value={session.puppyPerformance} />
        <RatingBar label="👤" value={session.trainerPerformance} />
      </div>

      {/* Distraction tags */}
      {session.distractions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {session.distractions.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {session.response && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Notes</p>
              <p className="text-sm text-slate-700">{session.response}</p>
            </div>
          )}
          {session.followUpResponse && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Next time</p>
              <p className="text-sm text-slate-700">{session.followUpResponse}</p>
            </div>
          )}
          {skill && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">Track</p>
              <p className="text-sm text-slate-600">{TRACK_INFO[skill.track].emoji} {TRACK_INFO[skill.track].name}</p>
            </div>
          )}
        </div>
      )}
    </button>
  );
}

// ─── Rating Bar ────────────────────────────────────────────────────────────────

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm" aria-hidden="true">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className={[
              "h-2 w-4 rounded-sm",
              n <= value ? "bg-amber-500" : "bg-slate-200",
            ].join(" ")}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-slate-500">{value}/5</span>
    </div>
  );
}

// ─── Performance Chart ─────────────────────────────────────────────────────────

function PerformanceChart({ chartData }: { chartData: Record<string, TrainingSession[]> }) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Pick the skill with the most sessions
  const skillIds = Object.keys(chartData).sort((a, b) => chartData[b].length - chartData[a].length);
  const activeSkill = selectedSkill ?? skillIds[0];

  if (!activeSkill || skillIds.length === 0) return null;

  const sessions = chartData[activeSkill].sort((a, b) => a.date.localeCompare(b.date));
  const skill = SKILLS_BY_ID[activeSkill];

  const width = 300;
  const height = 80;
  const padding = 10;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = sessions.map((s, i) => {
    const x = padding + (sessions.length > 1 ? (i / (sessions.length - 1)) * innerW : innerW / 2);
    const y = padding + innerH - ((s.puppyPerformance - 1) / 4) * innerH;
    return { x, y, value: s.puppyPerformance, date: s.date, breakthrough: s.breakthrough };
  });

  const pathD = points.length > 0
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
    : "";

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Performance Over Time</h3>
        <select
          value={activeSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-amber-500 focus:outline-none"
          aria-label="Select skill for chart"
        >
          {skillIds.map((id) => (
            <option key={id} value={id}>
              {SKILLS_BY_ID[id]?.name ?? id} ({chartData[id].length})
            </option>
          ))}
        </select>
      </div>

      {points.length >= 2 ? (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={`Performance chart for ${skill?.name ?? activeSkill}`}>
          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map((n) => {
            const y = padding + innerH - ((n - 1) / 4) * innerH;
            return (
              <g key={n}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
                <text x={padding - 2} y={y + 3} fontSize="8" fill="#94a3b8" textAnchor="end">{n}</text>
              </g>
            );
          })}
          {/* Line */}
          <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={p.breakthrough ? 4 : 3} fill={p.breakthrough ? "#f97316" : "#f59e0b"} stroke="white" strokeWidth="1" />
              {p.breakthrough && <text x={p.x} y={p.y - 6} fontSize="8" textAnchor="middle">💡</text>}
            </g>
          ))}
        </svg>
      ) : (
        <p className="text-center text-xs text-slate-400 py-4">Need at least 2 sessions to show chart</p>
      )}

      <p className="mt-1 text-center text-xs text-slate-400">
        {skill?.name} · {sessions.length} session{sessions.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
