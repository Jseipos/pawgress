"use client";

import { useEffect, useState } from "react";
import type { PuppyProfile, CoatType } from "@/lib/storage";
import { getPref, setPref, getProfile, saveProfile } from "@/lib/storage";
import TabBar, { type TabId } from "@/components/TabBar";
import Welcome from "@/components/Welcome";
import Onboarding from "@/components/Onboarding";
import Placeholder from "@/components/Placeholder";
import Train from "@/components/Train";
import Log from "@/components/Log";
import ConsistencyTracker from "@/components/ConsistencyTracker";
import Health from "@/components/Health";
import PuppyGrowth from "@/components/PuppyGrowth";
import Settings from "@/components/Settings";
import type { TrainingSession } from "@/lib/storage";

type View = "loading" | "welcome" | "onboarding" | "home" | "train" | "log" | "health" | "settings";

const PREF_ONBOARDING_COMPLETE = "onboarding_complete";
const PREF_SELECTED_COAT = "selected_coat";

export default function Page() {
  const [view, setView] = useState<View>("loading");
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [profile, setProfile] = useState<PuppyProfile | null>(null);
  const [initialCoat, setInitialCoat] = useState<CoatType>("smooth");
  const [error, setError] = useState<string | null>(null);
  const [logRefreshKey, setLogRefreshKey] = useState(0);

  // ─── Load on mount ──────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [onboardingComplete, savedCoat, savedProfile] = await Promise.all([
          getPref<boolean>(PREF_ONBOARDING_COMPLETE),
          getPref<CoatType>(PREF_SELECTED_COAT),
          getProfile("default"),
        ]);

        if (cancelled) return;

        if (onboardingComplete && savedProfile) {
          setProfile(savedProfile);
          setView("home");
          setActiveTab("home");
        } else {
          if (savedCoat) setInitialCoat(savedCoat);
          setView("welcome");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Init error:", err);
        setError("Could not load your data. Please refresh the page.");
        setView("welcome");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleWelcomeBegin(coatType: CoatType) {
    await setPref(PREF_SELECTED_COAT, coatType);
    setInitialCoat(coatType);
    setView("onboarding");
  }

  async function handleOnboardingComplete(p: PuppyProfile) {
    try {
      await saveProfile(p);
      await setPref(PREF_ONBOARDING_COMPLETE, true);
      setProfile(p);
      setView("home");
      setActiveTab("home");
    } catch (err) {
      console.error("Save error:", err);
      setError("Could not save your profile. Please try again.");
    }
  }

  function handleNavigate(tab: TabId) {
    setActiveTab(tab);
    setView(tab);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (view === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl animate-pulse" aria-hidden="true">
            🐾
          </span>
          <p className="text-slate-500">Loading Pawgress…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-slate-100 px-6">
        <div className="text-center">
          <span className="text-4xl" aria-hidden="true">
            ⚠️
          </span>
          <p className="mt-2 text-slate-700">{error}</p>
        </div>
      </div>
    );
  }

  if (view === "welcome") {
    return <Welcome onBegin={handleWelcomeBegin} />;
  }

  if (view === "onboarding") {
    return <Onboarding initialCoatType={initialCoat} onComplete={handleOnboardingComplete} />;
  }

  // Main app views with TabBar
  const trainDisabled = !profile;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 to-slate-100">
      <TabBar active={activeTab} onNavigate={handleNavigate} trainDisabled={trainDisabled} />

      <main className="flex flex-1 flex-col">
        {view === "home" && <HomeView profile={profile} onNavigate={handleNavigate} logRefreshKey={logRefreshKey} />}
        {view === "train" && !trainDisabled && (
          <Train
            puppyProfile={profile}
            onSessionSaved={() => setLogRefreshKey((k) => k + 1)}
          />
        )}
        {view === "train" && trainDisabled && <HomeView profile={profile} onNavigate={handleNavigate} logRefreshKey={logRefreshKey} />}
        {view === "log" && (
          <Log refreshKey={logRefreshKey} />
        )}
        {view === "health" && profile && (
          <Health profile={profile} />
        )}
        {view === "health" && !profile && (
          <Placeholder
            title="Health & Growth"
            icon="💊"
            description="Track weight, vet visits, feeding schedules, and health milestones."
          />
        )}
        {view === "settings" && (
          <Settings
            profile={profile}
            onProfileChanged={() => { /* trigger re-read */ }}
            onDataReset={() => {
              setProfile(null);
              setView("welcome");
            }}
          />
        )}
      </main>
    </div>
  );
}

// ─── Home View ────────────────────────────────────────────────────────────────

function HomeView({ profile, onNavigate, logRefreshKey }: { profile: PuppyProfile | null; onNavigate: (tab: TabId) => void; logRefreshKey: number }) {
  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="text-center">
          <span className="text-5xl" aria-hidden="true">
            🐾
          </span>
          <p className="mt-2 text-slate-600">Complete onboarding to get started</p>
        </div>
      </div>
    );
  }

  const ageWeeks = profile.currentAgeWeeks;

  return (
    <div className="flex-1 px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Hero card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-4xl">
              {coatEmoji(profile.coatType)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">{profile.puppyName}</h1>
              <p className="text-sm text-slate-500">
                {profile.breedName} · {ageWeeks} weeks old · {profile.lifeStage}
              </p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">Training Goals</p>
            <p className="mt-1 text-lg font-bold text-amber-600">{profile.trainingGoals.length}</p>
            <p className="text-xs text-slate-500">{profile.trainingGoals.join(", ")}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-400">Expected Weight</p>
            <p className="mt-1 text-lg font-bold text-amber-600">{profile.expectedAdultWeightLbs} lbs</p>
            <p className="text-xs text-slate-500">Adult</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-slate-800">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton emoji="🦴" label="Log Training" onClick={() => onNavigate("train")} />
            <ActionButton emoji="⚖️" label="Record Weight" onClick={() => onNavigate("health")} />
            <ActionButton emoji="📋" label="Supply Checklist" onClick={() => onNavigate("health")} />
            <ActionButton emoji="🌍" label="Socialization" onClick={() => onNavigate("health")} />
          </div>
        </div>

        {/* Consistency Tracker */}
        <ConsistencyTracker refreshKey={logRefreshKey} />

        {/* Growth stage */}
        <PuppyGrowth profile={profile} refreshKey={logRefreshKey} />

        {/* Tip of the day */}
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-slate-700">
            💡 <strong>Tip:</strong> Keep training sessions short — 5 to 15 minutes is ideal for puppies. End on a
            success!
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ emoji, label, onClick }: { emoji: string; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      aria-label={label}
    >
      <span className="text-xl" aria-hidden="true">
        {emoji}
      </span>
      {label}
    </button>
  );
}

function coatEmoji(coat: CoatType): string {
  const map: Record<CoatType, string> = {
    curly: "🐩",
    smooth: "🐕",
    double: "🐶",
    wire: "🦮",
    "long-silky": "💇",
    hairless: "🦂",
  };
  return map[coat] || "🐾";
}
