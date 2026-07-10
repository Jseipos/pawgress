"use client";

import { useEffect, useState } from "react";
import type { PuppyProfile, CoatType } from "@/lib/storage";
import { getAllSessions } from "@/lib/storage";
import { getGrowthStage, getNextGrowthStage, GROWTH_STAGES, type GrowthStage } from "@/lib/milestones";

interface PuppyGrowthProps {
  profile: PuppyProfile;
  refreshKey: number;
}

export default function PuppyGrowth({ profile, refreshKey }: PuppyGrowthProps) {
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    (async () => {
      const sessions = await getAllSessions();
      setTotalSessions(sessions.length);
    })();
  }, [refreshKey]);

  const current = getGrowthStage(totalSessions);
  const next = getNextGrowthStage(totalSessions);
  const progressInStage = next
    ? totalSessions - current.minSessions
    : 0;
  const sessionsNeeded = next
    ? next.minSessions - current.minSessions
    : 0;
  const stageProgress = next
    ? Math.min(100, (progressInStage / sessionsNeeded) * 100)
    : 100;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-700">Growth Stage</h3>
        <span className="text-xs text-slate-400">{totalSessions} sessions</span>
      </div>

      {/* SVG Growth visualization */}
      <div className="flex justify-center mb-3">
        <PuppySVG stage={current.stage} coatType={profile.coatType} />
      </div>

      {/* Stage label */}
      <div className="text-center mb-3">
        <p className="text-lg font-bold text-amber-600">
          {current.emoji} {current.label}
        </p>
        {next ? (
          <p className="text-xs text-slate-500">
            {next.minSessions - totalSessions} more session{next.minSessions - totalSessions !== 1 ? "s" : ""} to {next.emoji} {next.label}
          </p>
        ) : (
          <p className="text-xs text-amber-600 font-semibold">Maximum level reached! 🏆</p>
        )}
      </div>

      {/* Progress bar to next stage */}
      <div className="flex items-center gap-1 mb-3">
        {GROWTH_STAGES.map((stage) => {
          const isCurrent = stage.stage === current.stage;
          const isPassed = totalSessions >= stage.minSessions;
          return (
            <div
              key={stage.stage}
              className={[
                "flex-1 rounded-full h-2 transition-all",
                isPassed ? "bg-amber-500" : "bg-slate-200",
                isCurrent ? "ring-2 ring-amber-300 ring-offset-1" : "",
              ].join(" ")}
              title={`${stage.label} (${stage.minSessions} sessions)`}
              aria-label={`Stage: ${stage.label}, requires ${stage.minSessions} sessions`}
            />
          );
        })}
      </div>

      {/* Stage labels */}
      <div className="flex justify-between text-[8px] font-semibold text-slate-400">
        {GROWTH_STAGES.map((stage) => (
          <span key={stage.stage} className="text-center" style={{ width: "20%" }}>
            {stage.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Puppy SVG by stage + coat type ───────────────────────────────────────────

function PuppySVG({ stage, coatType }: { stage: GrowthStage; coatType: CoatType }) {
  // Coat-based colors
  const coatColors: Record<CoatType, { body: string; ear: string; dark: string }> = {
    curly:   { body: "#f5deb3", ear: "#e8c88a", dark: "#c4a35a" },  // cream/gold
    smooth:  { body: "#d4a373", ear: "#b8895a", dark: "#8b6940" },  // tan
    double:  { body: "#c9a87c", ear: "#a6855a", dark: "#7a5c38" },  // plush
    wire:    { body: "#a89968", ear: "#8a7a4e", dark: "#665c3a" },  // wiry
    "long-silky": { body: "#e8c89a", ear: "#d4a86a", dark: "#b88a4a" }, // golden
    hairless: { body: "#e0c0a0", ear: "#c4a080", dark: "#a08060" },  // skin
  };

  const c = coatColors[coatType] ?? coatColors.curly;

  // SVG scales by stage
  const sizes: Record<GrowthStage, { w: number; h: number }> = {
    "new-pup":  { w: 60, h: 60 },
    "learning": { w: 75, h: 75 },
    "growing":  { w: 90, h: 90 },
    "skilled":  { w: 100, h: 100 },
    "mastered": { w: 110, h: 110 },
  };

  const { w, h } = sizes[stage];
  const viewBox = 120;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${viewBox} ${viewBox}`}
      role="img"
      aria-label={`${current_stage_label(stage)} puppy, ${coatType} coat`}
    >
      {/* Body */}
      <ellipse cx="60" cy="78" rx={stage === "new-pup" ? 18 : stage === "learning" ? 22 : 28} ry={stage === "new-pup" ? 15 : stage === "learning" ? 18 : 22} fill={c.body} />

      {/* Head */}
      <circle cx="60" cy="48" r={stage === "new-pup" ? 16 : stage === "learning" ? 19 : 22} fill={c.body} />

      {/* Ears - vary by coat type */}
      {coatType === "curly" || coatType === "long-silky" ? (
        // Floppy ears
        <>
          <ellipse cx="44" cy="42" rx="8" ry="14" fill={c.ear} transform="rotate(-15 44 42)" />
          <ellipse cx="76" cy="42" rx="8" ry="14" fill={c.ear} transform="rotate(15 76 42)" />
        </>
      ) : coatType === "wire" ? (
        // Pointy wiry ears
        <>
          <polygon points="46,35 50,20 54,35" fill={c.ear} />
          <polygon points="66,35 70,20 74,35" fill={c.ear} />
        </>
      ) : (
        // Semi-floppy ears (smooth, double, hairless)
        <>
          <ellipse cx="45" cy="38" rx="7" ry="11" fill={c.ear} transform="rotate(-10 45 38)" />
          <ellipse cx="75" cy="38" rx="7" ry="11" fill={c.ear} transform="rotate(10 75 38)" />
        </>
      )}

      {/* Eyes */}
      <circle cx="53" cy="46" r="2.5" fill="#1a1a1a" />
      <circle cx="67" cy="46" r="2.5" fill="#1a1a1a" />
      {/* Eye sparkle */}
      <circle cx="54" cy="45" r="0.8" fill="white" />
      <circle cx="68" cy="45" r="0.8" fill="white" />

      {/* Nose */}
      <ellipse cx="60" cy="52" rx="3" ry="2" fill="#1a1a1a" />

      {/* Mouth - varies by stage */}
      {stage === "mastered" ? (
        // Happy confident smile
        <path d="M 54 56 Q 60 62 66 56" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : stage === "skilled" ? (
        // Gentle smile
        <path d="M 55 56 Q 60 59 65 56" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      ) : (
        // Small curious mouth
        <path d="M 57 56 Q 60 58 63 56" stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      )}

      {/* Legs */}
      <rect x="42" y="90" width="6" height={stage === "new-pup" ? 12 : 16} rx="3" fill={c.body} />
      <rect x="54" y="92" width="6" height={stage === "new-pup" ? 10 : 14} rx="3" fill={c.body} />
      <rect x="66" y="92" width="6" height={stage === "new-pup" ? 10 : 14} rx="3" fill={c.body} />
      <rect x="78" y="90" width="6" height={stage === "new-pup" ? 12 : 16} rx="3" fill={c.body} />

      {/* Tail - varies by stage */}
      {stage === "new-pup" ? (
        // Tiny stub tail
        <ellipse cx="84" cy="75" rx="4" ry="3" fill={c.body} />
      ) : stage === "learning" ? (
        // Curious tail up
        <path d="M 84 72 Q 92 65 95 58" stroke={c.body} strokeWidth="5" fill="none" strokeLinecap="round" />
      ) : (
        // Happy wagging tail
        <path d="M 84 72 Q 94 62 98 52" stroke={c.body} strokeWidth="6" fill="none" strokeLinecap="round" />
      )}

      {/* Stage-specific extras */}
      {stage === "mastered" && (
        // Trophy / crown for mastered
        <text x="60" y="25" fontSize="14" textAnchor="middle">👑</text>
      )}
      {stage === "skilled" && (
        // Confident posture - collar
        <g>
          <rect x="46" y="62" width="28" height="4" rx="2" fill="#f59e0b" />
          <circle cx="60" cy="66" r="2" fill="#fbbf24" />
        </g>
      )}
    </svg>
  );
}

function current_stage_label(stage: GrowthStage): string {
  const map: Record<GrowthStage, string> = {
    "new-pup": "New Pup",
    "learning": "Learning",
    "growing": "Growing",
    "skilled": "Skilled",
    "mastered": "Mastered",
  };
  return map[stage];
}
