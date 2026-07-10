"use client";

import { useEffect, useState } from "react";

export type TabId = "home" | "train" | "log" | "health" | "settings";

interface TabBarProps {
  active: TabId;
  onNavigate: (tab: TabId) => void;
  trainDisabled?: boolean;
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "train", label: "Train", icon: "🦴" },
  { id: "log", label: "Log", icon: "📋" },
  { id: "health", label: "Health", icon: "💊" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export default function TabBar({ active, onNavigate, trainDisabled }: TabBarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-around border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-sm"
      role="tablist"
      aria-label="Main navigation"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        const isDisabled = tab.id === "train" && trainDisabled;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.label}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            onClick={() => !isDisabled && onNavigate(tab.id)}
            className={[
              "flex flex-1 flex-col items-center gap-0.5 py-2 px-1 transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1",
              isDisabled
                ? "cursor-not-allowed opacity-40"
                : isActive
                  ? "text-amber-600"
                  : "text-slate-600 hover:text-amber-600",
            ].join(" ")}
          >
            <span className="text-2xl leading-none" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="text-xs font-semibold leading-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
