"use client";

import { useMemo } from "react";
import type { WeightEntry, PuppyProfile } from "@/lib/storage";

interface WeightChartProps {
  weights: WeightEntry[];
  profile: PuppyProfile;
}

export default function WeightChart({ weights, profile }: WeightChartProps) {
  const sorted = useMemo(() => [...weights].sort((a, b) => a.date.localeCompare(b.date)), [weights]);

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
        <span className="text-3xl" aria-hidden="true">⚖️</span>
        <p className="mt-2 text-sm text-slate-500">No weight entries yet</p>
        <p className="text-xs text-slate-400">Log your first weight to start tracking growth</p>
      </div>
    );
  }
  const targetWeight = profile.expectedAdultWeightLbs;

  const width = 320;
  const height = 120;
  const padding = 20;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  // Y scale: 0 to max(target, maxWeight) + 20%
  const maxWeight = Math.max(...sorted.map((w) => w.weightLbs), targetWeight);
  const yMax = Math.ceil(maxWeight * 1.2);

  // X scale: date range
  const dates = sorted.map((w) => new Date(w.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates, Date.now());
  const xRange = maxDate - minDate || 1;

  const points = sorted.map((w) => {
    const x = padding + ((new Date(w.date).getTime() - minDate) / xRange) * innerW;
    const y = padding + innerH - (w.weightLbs / yMax) * innerH;
    return { x, y, value: w.weightLbs, date: w.date };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  // Target line Y position
  const targetY = padding + innerH - (targetWeight / yMax) * innerH;

  // Current weight
  const current = sorted[sorted.length - 1];
  const pctOfAdult = Math.round((current.weightLbs / targetWeight) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Weight Tracker</h3>
        <span className="text-xs text-slate-400">
          Current: <strong className="text-amber-600">{current.weightLbs} lbs</strong> ({pctOfAdult}% of adult)
        </span>
      </div>

      {points.length >= 2 ? (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={`Weight chart from ${sorted[0].date} to ${current.date}`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const y = padding + innerH * (1 - f);
            const val = Math.round(yMax * f);
            return (
              <g key={f}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
                <text x={padding - 3} y={y + 3} fontSize="8" fill="#94a3b8" textAnchor="end">{val}</text>
              </g>
            );
          })}

          {/* Target weight line */}
          <line
            x1={padding}
            y1={targetY}
            x2={width - padding}
            y2={targetY}
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="4 3"
            opacity="0.6"
          />
          <text x={width - padding} y={targetY - 3} fontSize="7" fill="#f59e0b" textAnchor="end" fontWeight="bold">
            Target: {targetWeight} lbs
          </text>

          {/* Weight line */}
          <path d={pathD} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* Weight points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="3" fill="#f97316" stroke="white" strokeWidth="1" />
              {i === points.length - 1 && (
                <text x={p.x} y={p.y - 7} fontSize="8" fill="#c2410c" textAnchor="middle" fontWeight="bold">
                  {p.value} lbs
                </text>
              )}
            </g>
          ))}
        </svg>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-600 font-semibold">{current.weightLbs} lbs</p>
          <p className="text-xs text-slate-400">Log another entry to see the growth chart</p>
        </div>
      )}

      <p className="mt-1 text-center text-xs text-slate-400">
        {sorted.length} weight entr{sorted.length === 1 ? "y" : "ies"} · Expected adult: {targetWeight} lbs
      </p>
    </div>
  );
}
