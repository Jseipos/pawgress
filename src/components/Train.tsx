"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { PuppyProfile, TrainingSession, SkillProgress } from "@/lib/storage";
import { saveSession, getSkillProgress, getAllSkillProgress, updateSkillProgressAfterSession, generateId } from "@/lib/storage";
import {
  ALL_SKILLS,
  SKILLS_BY_ID,
  SKILLS_BY_TRACK,
  TRACK_INFO,
  suggestSkills,
  goalsToTracks,
  type Skill,
  type TrackId,
  type SkillSuggestion,
} from "@/lib/skills";

interface TrainProps {
  puppyProfile: PuppyProfile | null;
  onSessionSaved: (session: TrainingSession) => void;
}

type Step = "setup" | "train" | "rate" | "save";

const LOCATIONS = ["Home", "Yard", "Park", "Pet Store", "Class"];
const DISTRACTION_TAGS = ["Squirrels", "Other dogs", "Noise", "Food", "People", "None"];

const PUPPY_LABELS = ["Struggled", "Scattered", "Getting it", "Solid", "Nailed it"];
const TRAINER_LABELS = ["Off my game", "Distracted", "Present", "Engaged", "In sync"];

export default function Train({ puppyProfile, onSessionSaved }: TrainProps) {
  const [step, setStep] = useState<Step>("setup");
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [duration, setDuration] = useState(5);
  const [location, setLocation] = useState("Home");
  const [notes, setNotes] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [puppyRating, setPuppyRating] = useState(3);
  const [trainerRating, setTrainerRating] = useState(3);
  const [distractions, setDistractions] = useState<string[]>([]);
  const [breakthrough, setBreakthrough] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [skillProgressMap, setSkillProgressMap] = useState<Map<string, number>>(new Map());
  const [lastPracticedMap, setLastPracticedMap] = useState<Map<string, string>>(new Map());
  const [currentProgress, setCurrentProgress] = useState<SkillProgress | null>(null);

  // Load skill progress data
  const loadProgress = useCallback(async () => {
    if (!puppyProfile) return;
    const allProgress = await getAllSkillProgress("default");
    const progressMap = new Map<string, number>();
    const practicedMap = new Map<string, string>();
    for (const p of allProgress) {
      progressMap.set(p.skillId, p.currentLevel);
      practicedMap.set(p.skillId, p.lastPracticed);
    }
    setSkillProgressMap(progressMap);
    setLastPracticedMap(practicedMap);

    if (selectedSkill) {
      const prog = await getSkillProgress(selectedSkill.id, "default");
      setCurrentProgress(prog ?? null);
    }
  }, [puppyProfile, selectedSkill]);

  useEffect(() => {
    if (puppyProfile) {
      const tracks = goalsToTracks(puppyProfile.trainingGoals);
      const ageWeeks = puppyProfile.currentAgeWeeks;
      // Use the maps from state - but on first load they're empty so we need to load first
      (async () => {
        const allProgress = await getAllSkillProgress("default");
        const pMap = new Map<string, number>();
        const lMap = new Map<string, string>();
        for (const p of allProgress) {
          pMap.set(p.skillId, p.currentLevel);
          lMap.set(p.skillId, p.lastPracticed);
        }
        setSkillProgressMap(pMap);
        setLastPracticedMap(lMap);
        const sugg = suggestSkills(tracks, ageWeeks, pMap, lMap);
        setSuggestions(sugg);
      })();
    }
  }, [puppyProfile]);

  useEffect(() => {
    if (selectedSkill) {
      (async () => {
        const prog = await getSkillProgress(selectedSkill.id, "default");
        setCurrentProgress(prog ?? null);
      })();
    }
  }, [selectedSkill]);

  const currentLevel = currentProgress?.currentLevel ?? 1;
  const nextLevelData = selectedSkill?.levels[Math.min(currentLevel - 1, 4)];

  function handleSelectSkill(skill: Skill) {
    setSelectedSkill(skill);
    setShowSkillPicker(false);
    // Set duration based on level
    const level = currentProgress?.currentLevel ?? 1;
    const levelData = skill.levels[Math.min(level - 1, 4)];
    const match = levelData?.duration.match(/(\d+)/);
    if (match) setDuration(parseInt(match[1]));
  }

  function toggleDistraction(tag: string) {
    setDistractions((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function resetSession() {
    setStep("setup");
    setSelectedSkill(null);
    setNotes("");
    setFollowUp("");
    setPuppyRating(3);
    setTrainerRating(3);
    setDistractions([]);
    setBreakthrough(false);
    setSaved(false);
  }

  async function handleSave() {
    if (!selectedSkill || !puppyProfile) return;
    setSaving(true);

    const session: TrainingSession = {
      id: generateId(),
      date: new Date().toISOString(),
      skillId: selectedSkill.id,
      skillName: selectedSkill.name,
      durationMin: duration,
      location,
      response: notes,
      followUpResponse: followUp || undefined,
      puppyPerformance: puppyRating,
      trainerPerformance: trainerRating,
      distractions,
      breakthrough: breakthrough || undefined,
    };

    try {
      await saveSession(session);
      await updateSkillProgressAfterSession(selectedSkill.id, puppyRating, breakthrough, "default");
      onSessionSaved(session);
      setSaved(true);
      setStep("save");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  }

  if (!puppyProfile) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-slate-100 px-6 py-16">
        <div className="text-center">
          <span className="text-5xl" aria-hidden="true">🐾</span>
          <p className="mt-3 text-lg font-semibold text-slate-700">Set up your pet first</p>
          <p className="mt-1 text-sm text-slate-500">Complete onboarding to start training</p>
        </div>
      </div>
    );
  }

  // ─── Save Confirmation ──────────────────────────────────────────────────────
  if (saved) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-slate-100 px-6 py-16">
        <div className="text-center">
          <span className="text-6xl" aria-hidden="true">🎉</span>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">Session Saved!</h2>
          <p className="mt-2 text-slate-600">
            {selectedSkill?.name} · {duration} min · {location}
          </p>
          {breakthrough && (
            <p className="mt-2 text-amber-600 font-semibold">💡 Breakthrough session!</p>
          )}
          <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase text-slate-400">Puppy</p>
                <p className="text-lg font-bold text-amber-600">{puppyRating}/5</p>
                <p className="text-xs text-slate-500">{PUPPY_LABELS[puppyRating - 1]}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold uppercase text-slate-400">Trainer</p>
                <p className="text-lg font-bold text-amber-600">{trainerRating}/5</p>
                <p className="text-xs text-slate-500">{TRAINER_LABELS[trainerRating - 1]}</p>
              </div>
            </div>
          </div>
          <button
            onClick={resetSession}
            className="mt-6 rounded-full bg-amber-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            aria-label="Start another training session"
          >
            Train Again 🦴
          </button>
        </div>
      </div>
    );
  }

  // ─── Progress Indicator ─────────────────────────────────────────────────────
  const steps: Step[] = ["setup", "train", "rate", "save"];
  const stepIndex = steps.indexOf(step);
  const stepLabels = ["Setup", "Train", "Rate", "Save"];

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50 to-slate-100">
      {/* Progress indicator */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex flex-1 items-center">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                i <= stepIndex ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-400"
              }`}>
                {i + 1}
              </div>
              <span className={`ml-1.5 text-xs font-semibold ${i <= stepIndex ? "text-amber-600" : "text-slate-400"}`}>
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div className={`mx-1.5 h-0.5 flex-1 ${i < stepIndex ? "bg-amber-500" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {/* ─── Step: Setup ──────────────────────────────────────────────────── */}
        {step === "setup" && (
          <div className="space-y-5">
            {/* Skill suggestions */}
            {!selectedSkill && !showSkillPicker && (
              <>
                <div>
                  <h2 className="mb-1 text-2xl font-bold text-slate-900">Ready to train?</h2>
                  <p className="text-sm text-slate-500">Here are some skills worth working on:</p>
                </div>
                {suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.map((sugg) => {
                      const level = skillProgressMap.get(sugg.skill.id) ?? 0;
                      return (
                        <button
                          key={sugg.skill.id}
                          onClick={() => handleSelectSkill(sugg.skill)}
                          className="w-full rounded-xl border-2 border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-amber-400 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                          aria-label={`Select ${sugg.skill.name}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-slate-900">{sugg.skill.name}</span>
                                {level > 0 && (
                                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                    L{level}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-sm text-slate-500">{sugg.skill.category}</p>
                              <p className="mt-1 text-xs text-amber-600">{sugg.reason}</p>
                            </div>
                            <span className="text-2xl" aria-hidden="true">{TRACK_INFO[sugg.skill.track].emoji}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-slate-200 bg-white p-6 text-center">
                    <p className="text-sm text-slate-500">No suggestions yet. Pick a skill below to get started!</p>
                  </div>
                )}

                <button
                  onClick={() => setShowSkillPicker(true)}
                  className="w-full rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 py-3 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                  aria-label="Browse all skills"
                >
                  Or pick from all skills →
                </button>
              </>
            )}

            {/* Skill picker */}
            {showSkillPicker && !selectedSkill && (
              <SkillPicker
                ageWeeks={puppyProfile.currentAgeWeeks}
                skillProgressMap={skillProgressMap}
                onSelect={(skill) => handleSelectSkill(skill)}
                onBack={() => setShowSkillPicker(false)}
              />
            )}

            {/* Skill selected — show setup form */}
            {selectedSkill && (
              <div className="space-y-5">
                {/* Selected skill header */}
                <div className="rounded-xl border-2 border-amber-300 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-slate-900">{selectedSkill.name}</span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          {TRACK_INFO[selectedSkill.track].emoji} {TRACK_INFO[selectedSkill.track].name}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{selectedSkill.description}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedSkill(null); setShowSkillPicker(false); }}
                      className="text-sm font-semibold text-slate-400 hover:text-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                      aria-label="Change skill"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Current level + next level info */}
                  <div className="mt-4 rounded-lg bg-amber-50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-amber-800">Current Level</span>
                      <span className="rounded-full bg-amber-500 px-3 py-1 text-sm font-bold text-white">
                        L{currentLevel} — {selectedSkill.levels[currentLevel - 1].name}
                      </span>
                    </div>
                    {nextLevelData && (
                      <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                        <p><strong className="text-slate-800">Duration:</strong> {nextLevelData.duration}</p>
                        <p><strong className="text-slate-800">Distractions:</strong> {nextLevelData.distractions}</p>
                        <p><strong className="text-slate-800">Distance:</strong> {nextLevelData.distance}</p>
                        <p><strong className="text-slate-800">Goal:</strong> {nextLevelData.criteria}</p>
                      </div>
                    )}
                    {/* Sessions at current level */}
                    {currentProgress && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-slate-500">Progress to next level:</span>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className={`h-2 w-6 rounded-full ${i < currentProgress.sessionsAtCurrentLevel ? "bg-amber-500" : "bg-slate-200"}`}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">{currentProgress.sessionsAtCurrentLevel}/3</span>
                      </div>
                    )}
                    {/* Coaching tip */}
                    <div className="mt-3 border-t border-amber-200 pt-2">
                      <p className="text-xs italic text-slate-600">💡 {nextLevelData?.coachingTip}</p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Session duration: <span className="text-amber-600">{duration} min</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full accent-amber-500"
                    aria-label="Session duration in minutes"
                  />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>1 min</span><span>15 min</span><span>30 min</span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Location</label>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setLocation(loc)}
                        aria-pressed={location === loc}
                        aria-label={loc}
                        className={[
                          "rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                          location === loc
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-amber-300",
                        ].join(" ")}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start training button */}
                <button
                  onClick={() => setStep("train")}
                  className="w-full rounded-full bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                  aria-label="Start training session"
                >
                  Start Training →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Step: Train ──────────────────────────────────────────────────── */}
        {step === "train" && selectedSkill && (
          <div className="space-y-5">
            <div className="rounded-xl border-2 border-amber-300 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">{selectedSkill.name}</h2>
              <p className="text-sm text-slate-500">L{currentLevel} · {duration} min · {location}</p>
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-slate-700">
                <p className="font-semibold text-amber-800">Goal: {nextLevelData?.criteria}</p>
                <p className="mt-1 text-xs italic">💡 {nextLevelData?.coachingTip}</p>
              </div>
            </div>

            {/* Timer display (informational) */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-400">Recommended Duration</p>
              <p className="text-3xl font-bold text-amber-600">{duration} min</p>
              <p className="mt-1 text-xs text-slate-500">Keep sessions short and positive!</p>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                What happened? <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Biscuit got distracted by a squirrel but came back when called..."
                aria-label="Training notes"
                rows={4}
                className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Follow-up */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                What would you do differently next time? <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="e.g., Train in the backyard first, use higher-value treats..."
                aria-label="Follow-up notes"
                rows={2}
                className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep("setup")}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Go back to setup"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep("rate")}
                className="flex-1 rounded-full bg-amber-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                aria-label="Continue to rating"
              >
                Rate Session →
              </button>
            </div>
          </div>
        )}

        {/* ─── Step: Rate ──────────────────────────────────────────────────── */}
        {step === "rate" && selectedSkill && (
          <div className="space-y-6">
            {/* Puppy rating */}
            <div className="rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-lg font-bold text-slate-900">How did {puppyProfile.puppyName} do?</h3>
              <p className="mb-4 text-sm text-slate-500">Slide to rate their performance</p>
              <RatingSlider
                value={puppyRating}
                onChange={setPuppyRating}
                labels={PUPPY_LABELS}
                label="Puppy performance"
              />
            </div>

            {/* Trainer rating */}
            <div className="rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 text-lg font-bold text-slate-900">How did you do as trainer?</h3>
              <p className="mb-4 text-sm text-slate-500">Be honest — this helps you grow</p>
              <RatingSlider
                value={trainerRating}
                onChange={setTrainerRating}
                labels={TRAINER_LABELS}
                label="Trainer performance"
              />
            </div>

            {/* Distraction tags */}
            <div className="rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-lg font-bold text-slate-900">Distractions</h3>
              <div className="flex flex-wrap gap-2">
                {DISTRACTION_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleDistraction(tag)}
                    aria-pressed={distractions.includes(tag)}
                    aria-label={tag}
                    className={[
                      "rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                      distractions.includes(tag)
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-amber-300",
                    ].join(" ")}
                  >
                    {distractions.includes(tag) && "✓ "}
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Breakthrough toggle */}
            <button
              onClick={() => setBreakthrough(!breakthrough)}
              aria-pressed={breakthrough}
              className={[
                "w-full rounded-xl border-2 p-4 text-left transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                breakthrough
                  ? "border-amber-500 bg-amber-50 shadow-md"
                  : "border-slate-200 bg-white hover:border-amber-300",
              ].join(" ")}
              aria-label="Toggle breakthrough session"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">💡</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">This felt like a breakthrough</p>
                  <p className="text-xs text-slate-500">Mark sessions where something clicked</p>
                </div>
                <div className={[
                  "flex h-7 w-12 items-center rounded-full transition-all",
                  breakthrough ? "bg-amber-500" : "bg-slate-200",
                ].join(" ")}>
                  <div className={[
                    "h-5 w-5 rounded-full bg-white shadow transition-all",
                    breakthrough ? "ml-6" : "ml-1",
                  ].join(" ")} />
                </div>
              </div>
            </button>

            {/* Save button */}
            <div className="flex gap-2">
              <button
                onClick={() => setStep("train")}
                className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="Go back to train step"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-full bg-amber-500 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-50"
                aria-label="Save training session"
              >
                {saving ? "Saving..." : "Save Session ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Rating Slider Component ───────────────────────────────────────────────────

function RatingSlider({
  value,
  onChange,
  labels,
  label,
}: {
  value: number;
  onChange: (val: number) => void;
  labels: string[];
  label: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600">{labels[0]}</span>
        <span className="text-lg font-bold text-amber-600">{value}/5</span>
        <span className="text-sm font-semibold text-slate-600">{labels[4]}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((val) => (
          <button
            key={val}
            onClick={() => onChange(val)}
            aria-pressed={value === val}
            aria-label={`${label}: ${val} — ${labels[val - 1]}`}
            className={[
              "flex h-12 flex-1 flex-col items-center justify-center rounded-lg border-2 font-bold transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
              value === val
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-slate-200 bg-white text-slate-400 hover:border-amber-300",
            ].join(" ")}
          >
            <span className="text-lg">{val}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-center text-sm font-semibold text-amber-600">{labels[value - 1]}</p>
    </div>
  );
}

// ─── Skill Picker Component ────────────────────────────────────────────────────

function SkillPicker({
  ageWeeks,
  skillProgressMap,
  onSelect,
  onBack,
}: {
  ageWeeks: number;
  skillProgressMap: Map<string, number>;
  onSelect: (skill: Skill) => void;
  onBack: () => void;
}) {
  const [expandedTrack, setExpandedTrack] = useState<TrackId | null>("foundation");

  const trackOrder: TrackId[] = ["foundation", "family-pet", "socialization", "therapy-dog", "service-dog", "agility", "esa", "tricks"];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">All Skills</h2>
        <button
          onClick={onBack}
          className="text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label="Back to suggestions"
        >
          ← Back
        </button>
      </div>
      <p className="text-sm text-slate-500">Tap a track to expand, then pick a skill</p>

      {trackOrder.map((trackId) => {
        const info = TRACK_INFO[trackId];
        const skills = SKILLS_BY_TRACK[trackId];
        const isExpanded = expandedTrack === trackId;
        const availableCount = skills.filter((s) => s.minAgeWeeks <= ageWeeks).length;

        return (
          <div key={trackId} className="rounded-xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setExpandedTrack(isExpanded ? null : trackId)}
              className="flex w-full items-center justify-between p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-expanded={isExpanded}
              aria-label={`${info.name} track`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{info.emoji}</span>
                <div>
                  <p className="font-bold text-slate-900">{info.name}</p>
                  <p className="text-xs text-slate-500">{availableCount} skills available</p>
                </div>
              </div>
              <span className={`text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} aria-hidden="true">
                →
              </span>
            </button>

            {isExpanded && (
              <div className="border-t border-slate-100">
                {skills.map((skill) => {
                  const level = skillProgressMap.get(skill.id) ?? 0;
                  const ageOk = skill.minAgeWeeks <= ageWeeks;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => ageOk && onSelect(skill)}
                      disabled={!ageOk}
                      className={[
                        "flex w-full items-center justify-between px-4 py-3 text-left transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                        ageOk ? "hover:bg-amber-50" : "cursor-not-allowed opacity-40",
                      ].join(" ")}
                      aria-label={`Select ${skill.name}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800">{skill.name}</span>
                          {level > 0 && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                              L{level}
                            </span>
                          )}
                          {level >= 5 && <span className="text-xs">⭐</span>}
                        </div>
                        <p className="text-xs text-slate-400">
                          {ageOk ? `${skill.levels[level > 0 ? level - 1 : 0].duration} · ${skill.levels[level > 0 ? level - 1 : 0].distractions}` : `Available at ${skill.minAgeWeeks} weeks`}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
