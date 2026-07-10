"use client";

import { useState, useEffect, useCallback } from "react";
import type { PuppyProfile, WeightEntry, Milestone } from "@/lib/storage";
import {
  getAllWeights, saveWeight, deleteWeight, generateId,
  getAllMilestones, saveMilestone, deleteMilestone,
} from "@/lib/storage";
import { generateMilestones } from "@/lib/milestones";
import WeightChart from "./WeightChart";
import Socialization from "./Socialization";
import SupplyChecklist from "./SupplyChecklist";

interface HealthProps {
  profile: PuppyProfile;
}

type HealthTab = "vet" | "weight" | "milestones" | "socialization" | "supplies";

const TABS: { id: HealthTab; label: string; emoji: string }[] = [
  { id: "vet", label: "Vet", emoji: "🩺" },
  { id: "weight", label: "Weight", emoji: "⚖️" },
  { id: "milestones", label: "Milestones", emoji: "🎯" },
  { id: "socialization", label: "Social", emoji: "🌍" },
  { id: "supplies", label: "Supplies", emoji: "📦" },
];

// ─── Vet Schedule Data ────────────────────────────────────────────────────────

interface VetVisit {
  id: string;
  title: string;
  expectedAge: string;
  description: string;
  vaccines: string[];
}

const PUPPY_VET_SCHEDULE: VetVisit[] = [
  { id: "v1", title: "8-week visit", expectedAge: "8 weeks", description: "First wellness check, DA2PP round 1", vaccines: ["DA2PP (round 1)"] },
  { id: "v2", title: "12-week visit", expectedAge: "12 weeks", description: "DA2PP round 2, Bordetella", vaccines: ["DA2PP (round 2)", "Bordetella"] },
  { id: "v3", title: "16-week visit", expectedAge: "16 weeks", description: "DA2PP round 3, Rabies", vaccines: ["DA2PP (round 3)", "Rabies"] },
  { id: "v4", title: "6-month checkup", expectedAge: "6 months", description: "Spay/neuter consultation, general health", vaccines: ["Leptospirosis (if recommended)"] },
  { id: "v5", title: "12-month annual", expectedAge: "12 months", description: "Annual exam, booster vaccines", vaccines: ["DA2PP booster", "Rabies booster", "Bordetella", "Canine Influenza"] },
];

const ADULT_VET_SCHEDULE: VetVisit[] = [
  { id: "v1", title: "Initial wellness check", expectedAge: "Within 72 hours", description: "Full health assessment, confirm vaccination history", vaccines: ["Verify prior vaccines"] },
  { id: "v2", title: "Vaccine catch-up", expectedAge: "2-4 weeks", description: "Any overdue vaccines based on records", vaccines: ["DA2PP", "Rabies", "Bordetella"] },
  { id: "v3", title: "Dental evaluation", expectedAge: "1 month", description: "Dental health check, cleaning if needed", vaccines: [] },
  { id: "v4", title: "Annual exam", expectedAge: "12 months", description: "Annual wellness exam and boosters", vaccines: ["DA2PP booster", "Rabies booster"] },
];

const VACCINE_INFO = [
  { name: "DA2PP", rounds: 3, interval: "4 weeks", note: "Core vaccine — distemper, adenovirus, parvo, parainfluenza" },
  { name: "Rabies", rounds: 1, interval: "16 weeks", note: "Required by law. Booster at 1 year, then every 1-3 years." },
  { name: "Bordetella", rounds: 1, interval: "12 weeks", note: "Kennel cough — required for boarding, daycare, grooming" },
  { name: "Leptospirosis", rounds: 2, interval: "4 weeks", note: "Recommended for outdoor dogs, especially in wildlife areas" },
  { name: "Canine Influenza", rounds: 2, interval: "4 weeks", note: "Recommended for social dogs — daycare, boarding, shows" },
];

export default function Health({ profile }: HealthProps) {
  const [activeTab, setActiveTab] = useState<HealthTab>("vet");
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [vetCompleted, setVetCompleted] = useState<Set<string>>(new Set());
  const [vaccineCompleted, setVaccineCompleted] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    const [w, m] = await Promise.all([getAllWeights(), getAllMilestones()]);
    setWeights(w);

    if (m.length === 0) {
      // Seed milestones
      const seeded = generateMilestones(profile);
      for (const ms of seeded) {
        await saveMilestone(ms);
      }
      setMilestones(seeded);
    } else {
      setMilestones(m);
    }
  }, [profile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const vetSchedule = profile.isAdoption ? ADULT_VET_SCHEDULE : PUPPY_VET_SCHEDULE;

  // ─── Weight handlers ──────────────────────────────────────────────────────

  async function handleAddWeight(weightLbs: number, notes?: string) {
    const entry: WeightEntry = {
      id: generateId(),
      date: new Date().toISOString(),
      weightLbs,
      notes,
    };
    await saveWeight(entry);
    setWeights((prev) => [...prev, entry].sort((a, b) => a.date.localeCompare(b.date)));
  }

  async function handleDeleteWeight(id: string) {
    await deleteWeight(id);
    setWeights((prev) => prev.filter((w) => w.id !== id));
  }

  // ─── Milestone handlers ───────────────────────────────────────────────────

  async function toggleMilestone(ms: Milestone) {
    const updated: Milestone = {
      ...ms,
      completedDate: ms.completedDate ? undefined : new Date().toISOString(),
    };
    await saveMilestone(updated);
    setMilestones((prev) => prev.map((m) => (m.id === ms.id ? updated : m)));
  }

  async function handleDeleteMilestone(id: string) {
    await deleteMilestone(id);
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }

  // ─── Vet visit toggle ──────────────────────────────────────────────────────

  function toggleVetVisit(id: string) {
    setVetCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVaccine(name: string) {
    setVaccineCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50 to-slate-100">
      {/* Tab bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-2xl overflow-x-auto px-2 py-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
              className={[
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                activeTab === tab.id
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-600 hover:bg-amber-50",
              ].join(" ")}
            >
              <span aria-hidden="true">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {/* ─── Vet Schedule ─────────────────────────────────────────────────── */}
        {activeTab === "vet" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Vet Schedule</h2>
              <p className="text-sm text-slate-500">
                {profile.isAdoption ? "Post-adoption vet visits" : "Puppy vaccination timeline"}
              </p>
            </div>

            {/* Vet visits */}
            <div className="space-y-2">
              {vetSchedule.map((visit) => {
                const isDone = vetCompleted.has(visit.id);
                return (
                  <div
                    key={visit.id}
                    className={[
                      "rounded-xl border-2 bg-white p-4 shadow-sm transition-all",
                      isDone ? "border-amber-300 bg-amber-50/50" : "border-slate-200",
                    ].join(" ")}
                  >
                    <button
                      onClick={() => toggleVetVisit(visit.id)}
                      aria-pressed={isDone}
                      className="flex w-full items-start gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
                    >
                      <div className={[
                        "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 flex-shrink-0 transition-all",
                        isDone ? "border-amber-500 bg-amber-500" : "border-slate-300",
                      ].join(" ")}>
                        {isDone && <span className="text-xs text-white" aria-hidden="true">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={["font-bold", isDone ? "text-slate-400 line-through" : "text-slate-900"].join(" ")}>
                            {visit.title}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                            {visit.expectedAge}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{visit.description}</p>
                        {visit.vaccines.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {visit.vaccines.map((v) => (
                              <span key={v} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                                💉 {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Vaccine tracker */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-slate-700">Vaccine Tracker</h3>
              <div className="space-y-2">
                {VACCINE_INFO.map((vax) => {
                  const isDone = vaccineCompleted.has(vax.name);
                  return (
                    <button
                      key={vax.name}
                      onClick={() => toggleVaccine(vax.name)}
                      aria-pressed={isDone}
                      className={[
                        "flex w-full items-center gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-all",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                        isDone ? "border-amber-300 bg-amber-50" : "border-slate-100 hover:border-amber-200",
                      ].join(" ")}
                    >
                      <div className={[
                        "flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0 transition-all",
                        isDone ? "border-amber-500 bg-amber-500" : "border-slate-300",
                      ].join(" ")}>
                        {isDone && <span className="text-xs text-white" aria-hidden="true">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{vax.name}</span>
                          <span className="text-xs text-slate-400">{vax.rounds} dose{vax.rounds > 1 ? "s" : ""}</span>
                        </div>
                        <p className="text-xs text-slate-500">{vax.note}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-slate-400">
                💡 Check with your vet for a schedule specific to your dog and region.
              </p>
            </div>
          </div>
        )}

        {/* ─── Weight ──────────────────────────────────────────────────────── */}
        {activeTab === "weight" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Weight Tracking</h2>
              <p className="text-sm text-slate-500">
                Expected adult weight: <strong className="text-amber-600">{profile.expectedAdultWeightLbs} lbs</strong>
              </p>
            </div>

            <WeightChart weights={weights} profile={profile} />

            <WeightForm onAdd={handleAddWeight} />

            {/* Weight history */}
            {weights.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Weight History</h3>
                <div className="space-y-1.5">
                  {weights.sort((a, b) => b.date.localeCompare(a.date)).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <span className="font-bold text-amber-600">{entry.weightLbs} lbs</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.notes && <span className="text-xs text-slate-400">{entry.notes}</span>}
                        <button
                          onClick={() => handleDeleteWeight(entry.id)}
                          className="text-slate-300 hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded"
                          aria-label="Delete weight entry"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Milestones ──────────────────────────────────────────────────── */}
        {activeTab === "milestones" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Milestones</h2>
              <p className="text-sm text-slate-500">
                {profile.isAdoption ? "Decompression and growth timeline" : "Puppy development timeline"}
              </p>
            </div>

            {/* Group by category */}
            {(["first", "growth", "vet", "training", "socialization", "grooming"] as const).map((cat) => {
              const catMilestones = milestones.filter((m) => m.category === cat);
              if (catMilestones.length === 0) return null;

              const catEmoji: Record<string, string> = {
                first: "⭐", growth: "📈", vet: "🩺", training: "🦴", socialization: "🌍", grooming: "✂️",
              };
              const catLabel: Record<string, string> = {
                first: "Firsts", growth: "Growth", vet: "Vet", training: "Training", socialization: "Socialization", grooming: "Grooming",
              };

              return (
                <div key={cat} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-slate-800">
                    {catEmoji[cat]} {catLabel[cat]}
                  </h3>
                  <div className="space-y-1.5">
                    {catMilestones.map((ms) => {
                      const isDone = !!ms.completedDate;
                      return (
                        <div
                          key={ms.id}
                          className={[
                            "flex items-start gap-3 rounded-lg border-2 px-3 py-2.5 transition-all",
                            isDone ? "border-amber-300 bg-amber-50/50" : "border-slate-100",
                          ].join(" ")}
                        >
                          <button
                            onClick={() => toggleMilestone(ms)}
                            aria-pressed={isDone}
                            aria-label={`${ms.title}${isDone ? " — completed" : " — not yet"}`}
                            className="flex items-start gap-3 text-left flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg"
                          >
                            <div className={[
                              "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 flex-shrink-0 transition-all",
                              isDone ? "border-amber-500 bg-amber-500" : "border-slate-300",
                            ].join(" ")}>
                              {isDone && <span className="text-xs text-white" aria-hidden="true">✓</span>}
                            </div>
                            <div className="flex-1">
                              <span className={["text-sm font-semibold", isDone ? "text-slate-400 line-through" : "text-slate-800"].join(" ")}>
                                {ms.title}
                              </span>
                              {ms.targetDate && (
                                <span className="ml-2 text-xs text-slate-400">
                                  ~{new Date(ms.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              )}
                              {ms.notes && <p className="text-xs text-slate-500 mt-0.5">{ms.notes}</p>}
                              {isDone && ms.completedDate && (
                                <p className="text-xs text-amber-600 mt-0.5">
                                  ✓ {new Date(ms.completedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </p>
                              )}
                            </div>
                          </button>
                          {!ms.autoCalculated && (
                            <button
                              onClick={() => handleDeleteMilestone(ms.id)}
                              className="text-slate-300 hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded"
                              aria-label="Delete milestone"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── Socialization ──────────────────────────────────────────────── */}
        {activeTab === "socialization" && <Socialization profile={profile} />}

        {/* ─── Supplies ────────────────────────────────────────────────────── */}
        {activeTab === "supplies" && <SupplyChecklist profile={profile} />}
      </div>
    </div>
  );
}

// ─── Weight Form Component ────────────────────────────────────────────────────

function WeightForm({ onAdd }: { onAdd: (weightLbs: number, notes?: string) => void }) {
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  function handleSubmit() {
    const lbs = parseFloat(weight);
    if (isNaN(lbs) || lbs <= 0) return;
    onAdd(lbs, notes || undefined);
    setWeight("");
    setNotes("");
    setShowNotes(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-slate-700">Log Weight</h3>
      <div className="flex gap-2">
        <input
          type="number"
          step="0.1"
          min="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight in lbs"
          aria-label="Weight in pounds"
          className="flex-1 rounded-lg border-2 border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={!weight}
          className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-50"
          aria-label="Save weight entry"
        >
          Save
        </button>
      </div>
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="mt-2 text-xs font-semibold text-slate-400 hover:text-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
      >
        {showNotes ? "− Hide notes" : "+ Add notes"}
      </button>
      {showNotes && (
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., vet visit, morning weigh-in"
          aria-label="Weight entry notes"
          className="mt-2 w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
        />
      )}
    </div>
  );
}
