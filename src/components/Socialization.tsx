"use client";

import { useState, useEffect } from "react";
import type { SocializationItem, SocializationCategory, PuppyProfile } from "@/lib/storage";
import { getAllSocializationItems, saveSocializationItem, generateId } from "@/lib/storage";

interface SocializationProps {
  profile: PuppyProfile;
}

const SOCIAL_ITEMS: { category: SocializationCategory; label: string }[] = [
  // People
  { category: "people", label: "Men" },
  { category: "people", label: "Women" },
  { category: "people", label: "Children" },
  { category: "people", label: "Toddlers" },
  { category: "people", label: "Beards" },
  { category: "people", label: "Hats" },
  { category: "people", label: "Glasses" },
  { category: "people", label: "Uniforms" },
  { category: "people", label: "Mobility aids (canes, walkers, wheelchairs)" },

  // Environments
  { category: "environments", label: "Grass" },
  { category: "environments", label: "Concrete" },
  { category: "environments", label: "Carpet" },
  { category: "environments", label: "Tile" },
  { category: "environments", label: "Gravel" },
  { category: "environments", label: "Sand" },
  { category: "environments", label: "Busy street" },
  { category: "environments", label: "Quiet park" },
  { category: "environments", label: "Pet-friendly store" },
  { category: "environments", label: "Friend's home" },
  { category: "environments", label: "Car ride" },

  // Sounds
  { category: "sounds", label: "Vacuum" },
  { category: "sounds", label: "Doorbell" },
  { category: "sounds", label: "Thunder" },
  { category: "sounds", label: "Fireworks" },
  { category: "sounds", label: "Traffic" },
  { category: "sounds", label: "Other dogs barking" },
  { category: "sounds", label: "Music" },

  // Animals
  { category: "animals", label: "Vaccinated adult dogs" },
  { category: "animals", label: "Puppies" },
  { category: "animals", label: "Cats" },
  { category: "animals", label: "Observe wildlife (from distance)" },

  // Surfaces
  { category: "surfaces", label: "Metal grate" },
  { category: "surfaces", label: "Wobbly/unstable surface" },
  { category: "surfaces", label: "Elevator" },
  { category: "surfaces", label: "Slippery floor" },
];

const CATEGORY_INFO: { id: SocializationCategory; label: string; emoji: string }[] = [
  { id: "people", label: "People", emoji: "👥" },
  { id: "environments", label: "Environments", emoji: "🌍" },
  { id: "sounds", label: "Sounds", emoji: "🔊" },
  { id: "animals", label: "Animals", emoji: "🐾" },
  { id: "surfaces", label: "Surfaces", emoji: "🚶" },
];

export default function Socialization({ profile }: SocializationProps) {
  const [items, setItems] = useState<SocializationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let existing = await getAllSocializationItems();
      if (existing.length === 0) {
        // Seed defaults
        const seeded = SOCIAL_ITEMS.map((item) => ({
          id: generateId(),
          category: item.category,
          label: item.label,
          completed: false,
        }));
        for (const item of seeded) {
          await saveSocializationItem(item);
        }
        existing = seeded;
      }
      setItems(existing);
      setLoading(false);
    })();
  }, []);

  async function toggleItem(item: SocializationItem) {
    const updated: SocializationItem = {
      ...item,
      completed: !item.completed,
      completedDate: !item.completed ? new Date().toISOString() : undefined,
    };
    await saveSocializationItem(updated);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-slate-500">Loading socialization checklist...</p>
      </div>
    );
  }

  const totalComplete = items.filter((i) => i.completed).length;
  const totalItems = items.length;
  const overallPct = Math.round((totalComplete / totalItems) * 100);

  // Check if in critical socialization window (8-16 weeks)
  const inCriticalWindow = !profile.isAdoption && profile.currentAgeWeeks >= 8 && profile.currentAgeWeeks <= 16;

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-700">Socialization Checklist</h3>
          <span className="text-xs font-semibold text-amber-600">{totalComplete}/{totalItems} ({overallPct}%)</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
        </div>
        {inCriticalWindow && (
          <div className="mt-3 rounded-lg border-2 border-amber-200 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-800">
              ⚠️ Critical socialization window (8-16 weeks)
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Experiences during this period shape your dog for life. Prioritize positive exposures daily.
            </p>
          </div>
        )}
      </div>

      {/* Category sections */}
      {CATEGORY_INFO.map((cat) => {
        const catItems = items.filter((i) => i.category === cat.id);
        if (catItems.length === 0) return null;

        const catComplete = catItems.filter((i) => i.completed).length;
        const catPct = Math.round((catComplete / catItems.length) * 100);

        return (
          <div key={cat.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-800">
                {cat.emoji} {cat.label}
              </h4>
              <span className="text-xs font-semibold text-slate-500">{catComplete}/{catItems.length}</span>
            </div>

            {/* Category progress bar */}
            <div className="mb-3 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${catPct}%` }} />
            </div>

            {/* Items */}
            <div className="space-y-1.5">
              {catItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  aria-pressed={item.completed}
                  aria-label={`${item.label}${item.completed ? " — completed" : " — not yet done"}`}
                  className={[
                    "flex w-full items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-left text-sm transition-all",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                    item.completed
                      ? "border-amber-300 bg-amber-50 text-slate-600"
                      : "border-slate-100 bg-white text-slate-700 hover:border-amber-200",
                  ].join(" ")}
                >
                  <div className={[
                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all flex-shrink-0",
                    item.completed ? "border-amber-500 bg-amber-500" : "border-slate-300",
                  ].join(" ")}>
                    {item.completed && (
                      <span className="text-xs text-white" aria-hidden="true">✓</span>
                    )}
                  </div>
                  <span className={item.completed ? "line-through text-slate-400" : ""}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
