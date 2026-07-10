"use client";

import { useState } from "react";

export interface ChecklistItems {
  floor: boolean;
  cords: boolean;
  smallObjects: boolean;
  foodSweep: boolean;
}

interface GuardianChecklistProps {
  onComplete: (items: ChecklistItems) => void;
  onCancel: () => void;
}

const CHECKLIST_ITEMS: {
  key: keyof ChecklistItems;
  emoji: string;
  question: string;
  ariaLabel: string;
}[] = [
  { key: "floor", emoji: "🧸", question: "Toys off the floor?", ariaLabel: "Are toys off the floor?" },
  { key: "cords", emoji: "🔌", question: "Cords safe?", ariaLabel: "Are cords safe and out of reach?" },
  { key: "smallObjects", emoji: "📏", question: "Small things picked up?", ariaLabel: "Are small things picked up?" },
  { key: "foodSweep", emoji: "🍎", question: "Food swept?", ariaLabel: "Is food swept from surfaces and floor?" },
];

export default function GuardianChecklist({ onComplete, onCancel }: GuardianChecklistProps) {
  const [items, setItems] = useState<ChecklistItems>({
    floor: false,
    cords: false,
    smallObjects: false,
    foodSweep: false,
  });

  const allYes = Object.values(items).every(Boolean);

  function toggle(key: keyof ChecklistItems) {
    setItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-purple-50 to-pink-50 px-4 py-6">
      <div className="mx-auto w-full max-w-lg flex-1">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-purple-700">Today&apos;s Tasks</h1>
          <p className="mt-1 text-lg text-purple-500">Tap YES when you finish each one!</p>
        </div>

        {/* Checklist items */}
        <div className="space-y-4">
          {CHECKLIST_ITEMS.map((item) => {
            const done = items[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggle(item.key)}
                aria-label={item.ariaLabel}
                aria-pressed={done}
                className={[
                  "flex w-full items-center gap-4 rounded-2xl border-4 p-5 transition-all",
                  "focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400",
                  done
                    ? "border-green-400 bg-green-50 shadow-lg"
                    : "border-purple-200 bg-white shadow-md hover:border-purple-400",
                ].join(" ")}
                style={{ minHeight: "80px" }}
              >
                <span className="text-5xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className={[
                  "flex-1 text-left text-xl font-bold",
                  done ? "text-green-700" : "text-purple-800",
                ].join(" ")}>
                  {item.question}
                </span>
                <span
                  className={[
                    "flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold transition-all",
                    done
                      ? "bg-green-500 text-white scale-110"
                      : "bg-purple-100 text-purple-400",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  {done ? "✓" : "?"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Complete button */}
        <button
          onClick={() => allYes && onComplete(items)}
          disabled={!allYes}
          aria-label="Complete today's tasks"
          className={[
            "mt-8 w-full rounded-full py-5 text-2xl font-bold transition-all",
            "focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 focus-visible:ring-offset-2",
            allYes
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl hover:scale-105 active:scale-95"
              : "cursor-not-allowed bg-slate-200 text-slate-400",
          ].join(" ")}
          style={{ minHeight: "70px" }}
        >
          {allYes ? "🎉 Complete! 🎉" : "Finish all tasks to continue"}
        </button>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="mt-4 w-full rounded-full py-3 text-lg font-semibold text-purple-400 hover:text-purple-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          aria-label="Go back"
        >
          ← Back
        </button>

        {/* Encouragement */}
        {!allYes && (
          <p className="mt-4 text-center text-lg text-purple-400">
            You can do it! 💪
          </p>
        )}
      </div>
    </div>
  );
}
