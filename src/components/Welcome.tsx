"use client";

import { useState } from "react";
import type { CoatType } from "@/lib/storage";

interface WelcomeProps {
  onBegin: (coatType: CoatType) => void;
}

const COAT_OPTIONS: { value: CoatType; emoji: string; label: string }[] = [
  { value: "curly", emoji: "🐩", label: "Curly" },
  { value: "smooth", emoji: "🐕", label: "Smooth" },
  { value: "double", emoji: "🐶", label: "Double Coat" },
  { value: "wire", emoji: "🦮", label: "Wire" },
  { value: "long-silky", emoji: "💇", label: "Long & Silky" },
  { value: "hairless", emoji: "🦂", label: "Hairless" },
];

export default function Welcome({ onBegin }: WelcomeProps) {
  const [selectedCoat, setSelectedCoat] = useState<CoatType | null>(null);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-slate-100 px-6 py-12">
      {/* Hero */}
      <div className="mb-8 text-center">
        <div className="mb-4 text-7xl" aria-hidden="true">
          🐾
        </div>
        <h1 className="mb-2 text-4xl font-bold text-slate-900">Pawgress</h1>
        <p className="max-w-md text-lg text-slate-600">
          Track your dog&apos;s training, growth, and health — all in one place. Local-first, private, and made with
          love.
        </p>
      </div>

      {/* Coat type picker */}
      <div className="w-full max-w-lg">
        <h2 className="mb-4 text-center text-xl font-semibold text-slate-800">
          What does your pup look like?
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {COAT_OPTIONS.map((opt) => {
            const isSelected = selectedCoat === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSelectedCoat(opt.value)}
                aria-label={opt.label}
                aria-pressed={isSelected}
                className={[
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-amber-500 bg-amber-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/50",
                ].join(" ")}
              >
                <span className="text-4xl" aria-hidden="true">
                  {opt.emoji}
                </span>
                <span className="text-sm font-semibold text-slate-700">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => selectedCoat && onBegin(selectedCoat)}
        disabled={!selectedCoat}
        aria-label="Let's set up your puppy profile"
        className={[
          "mt-8 rounded-full px-8 py-4 text-lg font-bold transition-all",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
          selectedCoat
            ? "bg-amber-500 text-white shadow-lg hover:bg-amber-600 active:scale-95"
            : "cursor-not-allowed bg-slate-200 text-slate-400",
        ].join(" ")}
      >
        Let&apos;s set up your puppy profile →
      </button>

      {!selectedCoat && (
        <p className="mt-3 text-sm text-slate-400">Pick a coat type to get started</p>
      )}

      {/* Privacy note */}
      <p className="mt-12 max-w-sm text-center text-xs text-slate-400">
        🔒 All data stays on your device. No account, no server, no tracking.
      </p>
    </div>
  );
}
