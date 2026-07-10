"use client";

import { useState, useMemo } from "react";
import type { PuppyProfile, CoatType, Gender, FeedingType } from "@/lib/storage";
import { calculateAgeWeeks, calculateLifeStage } from "@/lib/storage";

interface OnboardingProps {
  initialCoatType: CoatType;
  onComplete: (profile: PuppyProfile) => void;
}

// ─── Step definitions ─────────────────────────────────────────────────────────

const TRAINING_GOAL_OPTIONS = [
  "Basic Obedience",
  "Therapy Dog",
  "ESA",
  "Service Dog",
  "Agility",
  "Family Pet",
  "Tricks",
];

const FEEDING_TYPE_OPTIONS: { value: FeedingType; label: string; emoji: string }[] = [
  { value: "kibble", label: "Kibble", emoji: "🥣" },
  { value: "mixed", label: "Mixed", emoji: "🍽️" },
  { value: "homemade", label: "Homemade", emoji: "🍳" },
  { value: "raw", label: "Raw", emoji: "🥩" },
];

const TEMPERAMENT_SCALES = [
  { key: "curious", label: "Curious", leftLabel: "Cautious", rightLabel: "Curious" },
  { key: "confident", label: "Confidence", leftLabel: "Shy", rightLabel: "Confident" },
  { key: "energetic", label: "Energy", leftLabel: "Laid-back", rightLabel: "Energetic" },
  { key: "mouthy", label: "Mouthiness", leftLabel: "Gentle", rightLabel: "Mouthy" },
  { key: "sensitive", label: "Sensitivity", leftLabel: "Resilient", rightLabel: "Sensitive" },
  { key: "reactive", label: "Reactivity", leftLabel: "Calm", rightLabel: "Reactive" },
];

const LIFESTYLE_QUESTIONS = [
  {
    key: "homeType",
    label: "Home type",
    options: ["House", "Apartment"],
  },
  {
    key: "yardAccess",
    label: "Yard access",
    options: ["Private yard", "Shared yard", "No yard", "Nearby park"],
  },
  {
    key: "otherPets",
    label: "Other pets in home?",
    options: ["Yes", "No"],
  },
  {
    key: "kidsInHome",
    label: "Children in home?",
    options: ["Yes", "No"],
  },
  {
    key: "workSchedule",
    label: "Work schedule",
    options: ["Home all day", "Part-time away", "Full-time away", "Hybrid"],
  },
  {
    key: "trainingExperience",
    label: "Training experience",
    options: ["First-time owner", "Some experience", "Experienced"],
  },
];

const STEPS = [
  { id: 0, title: "Your Pup", emoji: "🐶" },
  { id: 1, title: "Training Goals", emoji: "🎯" },
  { id: 2, title: "Feeding", emoji: "🥣" },
  { id: 3, title: "Temperament", emoji: "🧡" },
  { id: 4, title: "Lifestyle", emoji: "🏠" },
  { id: 5, title: "Your Plan", emoji: "📋" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Onboarding({ initialCoatType, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Step 1: Your Pup
  const [puppyName, setPuppyName] = useState("");
  const [coatType, setCoatType] = useState<CoatType>(initialCoatType);
  const [breedName, setBreedName] = useState("");
  const [expectedAdultWeightLbs, setExpectedAdultWeightLbs] = useState<number | "">("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isAdoption, setIsAdoption] = useState(false);
  const [startWeightLbs, setStartWeightLbs] = useState<number | "">("");

  // Step 2: Training Goals
  const [trainingGoals, setTrainingGoals] = useState<string[]>([]);

  // Step 3: Feeding
  const [feedingType, setFeedingType] = useState<FeedingType | null>(null);
  const [feedingBrand, setFeedingBrand] = useState("");

  // Step 4: Temperament (1-5 scales)
  const [temperament, setTemperament] = useState<Record<string, number>>({
    curious: 3,
    confident: 3,
    energetic: 3,
    mouthy: 3,
    sensitive: 3,
    reactive: 3,
  });
  const [temperamentNotes, setTemperamentNotes] = useState("");

  // Step 5: Lifestyle
  const [lifestyle, setLifestyle] = useState<Record<string, string>>({});

  // ─── Validation ─────────────────────────────────────────────────────────────

  const stepValid = useMemo(() => {
    switch (step) {
      case 0:
        return (
          puppyName.trim() !== "" &&
          breedName.trim() !== "" &&
          expectedAdultWeightLbs !== "" &&
          expectedAdultWeightLbs > 0 &&
          gender !== null &&
          birthDate !== "" &&
          startDate !== ""
        );
      case 1:
        return trainingGoals.length > 0;
      case 2:
        return feedingType !== null;
      case 3:
        return true; // Optional, defaults are fine
      case 4:
        return LIFESTYLE_QUESTIONS.every((q) => lifestyle[q.key] !== undefined);
      default:
        return true;
    }
  }, [
    step,
    puppyName,
    breedName,
    expectedAdultWeightLbs,
    gender,
    birthDate,
    startDate,
    trainingGoals,
    feedingType,
    lifestyle,
  ]);

  const progress = ((step + 1) / STEPS.length) * 100;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function toggleGoal(goal: string) {
    setTrainingGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  }

  function handleNext() {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      setShowSummary(true);
      setStep(5);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
    }
  }

  function handleComplete() {
    const ageWeeks = birthDate ? calculateAgeWeeks(birthDate) : 0;
    const lifeStage = calculateLifeStage(ageWeeks, breedName);

    // Build temperament notes from scales
    const temperamentParts: string[] = [];
    for (const scale of TEMPERAMENT_SCALES) {
      const val = temperament[scale.key];
      if (val <= 2) temperamentParts.push(`${scale.label}: ${scale.leftLabel} (${val}/5)`);
      else if (val >= 4) temperamentParts.push(`${scale.label}: ${scale.rightLabel} (${val}/5)`);
    }
    if (temperamentNotes.trim()) temperamentParts.push(temperamentNotes.trim());

    const profile: PuppyProfile = {
      id: "default",
      createdDate: new Date().toISOString(),
      puppyName: puppyName.trim(),
      breedName: breedName.trim(),
      coatType,
      expectedAdultWeightLbs: Number(expectedAdultWeightLbs),
      gender: gender!,
      birthDate,
      startDate,
      currentAgeWeeks: ageWeeks,
      lifeStage,
      isAdoption,
      startWeightLbs: startWeightLbs === "" ? undefined : Number(startWeightLbs),
      trainingGoals,
      feedingType: feedingType!,
      feedingBrand: feedingBrand.trim() || undefined,
      temperamentNotes: temperamentParts.join("; ") || undefined,
      avatarType: coatType,
    };

    onComplete(profile);
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (showSummary || step === 5) {
    return <SummaryScreen profile={buildSummaryProfile()} onBack={() => { setShowSummary(false); setStep(4); }} onComplete={handleComplete} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 to-slate-100">
      {/* Progress bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            disabled={step === 0}
            aria-label="Go back"
            className={[
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
              step === 0 ? "cursor-not-allowed text-slate-300" : "text-amber-600 hover:bg-amber-50",
            ].join(" ")}
          >
            ← Back
          </button>
          <span className="text-sm font-semibold text-slate-600">
            Step {step + 1} of {STEPS.length - 1}
          </span>
          <div className="w-24" aria-hidden />
        </div>
        <div className="h-1.5 w-full bg-slate-200">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Onboarding progress"
          />
        </div>
      </div>

      {/* Step content */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">
            {STEPS[step].emoji}
          </span>
          <h2 className="text-2xl font-bold text-slate-900">{STEPS[step].title}</h2>
        </div>

        {/* Step 0: Your Pup */}
        {step === 0 && (
          <div className="space-y-5">
            <Field label="Puppy name" required>
              <input
                type="text"
                value={puppyName}
                onChange={(e) => setPuppyName(e.target.value)}
                placeholder="e.g., Biscuit"
                aria-label="Puppy name"
                className={inputClass}
              />
            </Field>

            <Field label="Coat type" required>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { value: "curly", emoji: "🐩", label: "Curly" },
                    { value: "smooth", emoji: "🐕", label: "Smooth" },
                    { value: "double", emoji: "🐶", label: "Double" },
                    { value: "wire", emoji: "🦮", label: "Wire" },
                    { value: "long-silky", emoji: "💇", label: "Long & Silky" },
                    { value: "hairless", emoji: "🦂", label: "Hairless" },
                  ] as { value: CoatType; emoji: string; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCoatType(opt.value)}
                    aria-pressed={coatType === opt.value}
                    aria-label={opt.label}
                    className={[
                      "flex flex-col items-center gap-1 rounded-lg border-2 p-2.5 transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                      coatType === opt.value
                        ? "border-amber-500 bg-amber-50"
                        : "border-slate-200 bg-white hover:border-amber-300",
                    ].join(" ")}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {opt.emoji}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{opt.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Breed" required>
              <input
                type="text"
                value={breedName}
                onChange={(e) => setBreedName(e.target.value)}
                placeholder="e.g., Golden Retriever"
                aria-label="Breed"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Expected adult weight (lbs)" required>
                <input
                  type="number"
                  value={expectedAdultWeightLbs}
                  onChange={(e) =>
                    setExpectedAdultWeightLbs(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g., 65"
                  min={1}
                  aria-label="Expected adult weight in pounds"
                  className={inputClass}
                />
              </Field>

              <Field label="Gender" required>
                <div className="flex gap-2">
                  {(["male", "female"] as Gender[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      aria-pressed={gender === g}
                      aria-label={g === "male" ? "Male" : "Female"}
                      className={[
                        "flex-1 rounded-lg border-2 py-2.5 text-sm font-semibold capitalize transition-all",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                        gender === g
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300",
                      ].join(" ")}
                    >
                      {g === "male" ? "♂ Male" : "♀ Female"}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Birth date" required>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  aria-label="Puppy birth date"
                  className={inputClass}
                />
              </Field>

              <Field label="Came home date" required>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  aria-label="Date puppy came home"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Did you adopt your pup?">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdoption(true)}
                  aria-pressed={isAdoption}
                  className={[
                    "flex-1 rounded-lg border-2 py-2.5 text-sm font-semibold transition-all",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                    isAdoption
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-amber-300",
                  ].join(" ")}
                >
                  🏠 Adopted
                </button>
                <button
                  onClick={() => setIsAdoption(false)}
                  aria-pressed={!isAdoption}
                  className={[
                    "flex-1 rounded-lg border-2 py-2.5 text-sm font-semibold transition-all",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                    !isAdoption
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-amber-300",
                  ].join(" ")}
                >
                  🐾 From breeder
                </button>
              </div>
            </Field>

            {isAdoption && (
              <Field label="Starting weight (lbs)">
                <input
                  type="number"
                  value={startWeightLbs}
                  onChange={(e) =>
                    setStartWeightLbs(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="e.g., 12"
                  min={0}
                  aria-label="Starting weight in pounds"
                  className={inputClass}
                />
              </Field>
            )}
          </div>
        )}

        {/* Step 1: Training Goals */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-slate-600">
              What are your training goals for {puppyName || "your pup"}? Select all that apply.
            </p>
            <div className="flex flex-wrap gap-2">
              {TRAINING_GOAL_OPTIONS.map((goal) => {
                const isSelected = trainingGoals.includes(goal);
                return (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    aria-pressed={isSelected}
                    aria-label={goal}
                    className={[
                      "rounded-full border-2 px-4 py-2 text-sm font-semibold transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                      isSelected
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-amber-300",
                    ].join(" ")}
                  >
                    {isSelected && "✓ "}
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Feeding */}
        {step === 2 && (
          <div className="space-y-5">
            <Field label="Feeding type" required>
              <div className="grid grid-cols-2 gap-2">
                {FEEDING_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFeedingType(opt.value)}
                    aria-pressed={feedingType === opt.value}
                    aria-label={opt.label}
                    className={[
                      "flex items-center gap-3 rounded-lg border-2 p-3.5 transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                      feedingType === opt.value
                        ? "border-amber-500 bg-amber-50"
                        : "border-slate-200 bg-white hover:border-amber-300",
                    ].join(" ")}
                  >
                    <span className="text-2xl" aria-hidden="true">
                      {opt.emoji}
                    </span>
                    <span className="font-semibold text-slate-700">{opt.label}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Food brand (optional)">
              <input
                type="text"
                value={feedingBrand}
                onChange={(e) => setFeedingBrand(e.target.value)}
                placeholder="e.g., Purina Pro Plan Puppy"
                aria-label="Food brand"
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {/* Step 3: Temperament */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-slate-600">
              Rate {puppyName || "your pup"} on each scale. This helps personalize training recommendations.
            </p>
            {TEMPERAMENT_SCALES.map((scale) => (
              <div key={scale.key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{scale.leftLabel}</span>
                  <span className="font-bold text-amber-600">{temperament[scale.key]}/5</span>
                  <span className="font-semibold text-slate-700">{scale.rightLabel}</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      onClick={() => setTemperament((prev) => ({ ...prev, [scale.key]: val }))}
                      aria-pressed={temperament[scale.key] === val}
                      aria-label={`${scale.label}: ${val} out of 5`}
                      className={[
                        "h-10 flex-1 rounded-lg border-2 font-bold transition-all",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                        temperament[scale.key] === val
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-slate-200 bg-white text-slate-400 hover:border-amber-300",
                      ].join(" ")}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <Field label="Additional temperament notes (optional)">
              <textarea
                value={temperamentNotes}
                onChange={(e) => setTemperamentNotes(e.target.value)}
                placeholder="Anything else about your pup's personality..."
                aria-label="Additional temperament notes"
                rows={3}
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {/* Step 4: Lifestyle */}
        {step === 4 && (
          <div className="space-y-5">
            <p className="text-slate-600">
              Tell us about your living situation so we can tailor recommendations.
            </p>
            {LIFESTYLE_QUESTIONS.map((q) => (
              <Field key={q.key} label={q.label}>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setLifestyle((prev) => ({ ...prev, [q.key]: opt }))}
                      aria-pressed={lifestyle[q.key] === opt}
                      aria-label={`${q.label}: ${opt}`}
                      className={[
                        "rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                        lifestyle[q.key] === opt
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-300",
                      ].join(" ")}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </Field>
            ))}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className={[
                  "h-2 w-2 rounded-full transition-all",
                  s.id === step ? "w-6 bg-amber-500" : s.id < step ? "bg-amber-300" : "bg-slate-200",
                ].join(" ")}
                aria-hidden="true"
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={!stepValid}
            aria-label="Continue to next step"
            className={[
              "rounded-full px-6 py-2.5 text-sm font-bold transition-all",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
              stepValid
                ? "bg-amber-500 text-white shadow-md hover:bg-amber-600 active:scale-95"
                : "cursor-not-allowed bg-slate-200 text-slate-400",
            ].join(" ")}
          >
            {step === 4 ? "See Your Plan →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Summary builder (inline) ───────────────────────────────────────────────

  function buildSummaryProfile(): Partial<PuppyProfile> {
    const ageWeeks = birthDate ? calculateAgeWeeks(birthDate) : 0;
    const lifeStage = calculateLifeStage(ageWeeks, breedName);
    return {
      puppyName,
      breedName,
      coatType,
      expectedAdultWeightLbs: Number(expectedAdultWeightLbs),
      gender: gender ?? undefined,
      birthDate,
      startDate,
      currentAgeWeeks: ageWeeks,
      lifeStage,
      isAdoption,
      trainingGoals,
      feedingType: feedingType ?? undefined,
      feedingBrand,
      temperamentNotes: temperamentNotes,
    };
  }
}

// ─── Summary Screen ───────────────────────────────────────────────────────────

function SummaryScreen({
  profile,
  onBack,
  onComplete,
}: {
  profile: Partial<PuppyProfile>;
  onBack: () => void;
  onComplete: () => void;
}) {
  const ageWeeks = profile.currentAgeWeeks ?? 0;
  const lifeStage = profile.lifeStage ?? "puppy";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 to-slate-100">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <div className="mb-6 text-center">
          <span className="text-5xl" aria-hidden="true">
            🐾
          </span>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {profile.puppyName}&apos;s Plan
          </h2>
          <p className="mt-1 text-slate-600">Here&apos;s what we&apos;ve set up for you</p>
        </div>

        {/* Profile card */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-amber-600">🐶 Puppy Profile</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <SummaryItem label="Name" value={profile.puppyName} />
            <SummaryItem label="Breed" value={profile.breedName} />
            <SummaryItem label="Coat" value={coatLabel(profile.coatType)} />
            <SummaryItem label="Gender" value={profile.gender === "male" ? "Male ♂" : "Female ♀"} />
            <SummaryItem label="Age" value={`${ageWeeks} weeks`} />
            <SummaryItem label="Life stage" value={lifeStage} capitalize />
            <SummaryItem label="Expected weight" value={`${profile.expectedAdultWeightLbs} lbs`} />
            <SummaryItem label="Source" value={profile.isAdoption ? "Adopted 🏠" : "Breeder 🐾"} />
          </dl>
        </div>

        {/* Training goals */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-amber-600">🎯 Training Goals</h3>
          <div className="flex flex-wrap gap-2">
            {profile.trainingGoals?.map((goal) => (
              <span
                key={goal}
                className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>

        {/* Feeding */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-bold text-amber-600">🥣 Feeding</h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <SummaryItem label="Type" value={profile.feedingType} capitalize />
            <SummaryItem label="Brand" value={profile.feedingBrand || "Not specified"} />
          </dl>
        </div>

        {/* Next steps */}
        <div className="mb-4 rounded-xl border-2 border-amber-200 bg-amber-50 p-5">
          <h3 className="mb-2 text-lg font-bold text-amber-700">📋 What&apos;s Next?</h3>
          <ul className="space-y-1.5 text-sm text-slate-700">
            <li>🦴 Start logging training sessions</li>
            <li>⚖️ Record weight to track growth</li>
            <li>📋 Check the supply checklist</li>
            <li>🌍 Begin socialization tracking</li>
          </ul>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="sticky bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button
            onClick={onBack}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Go back to edit"
          >
            ← Back
          </button>
          <button
            onClick={onComplete}
            className="rounded-full bg-amber-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            aria-label="Complete setup and start using Pawgress"
          >
            Start Training! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-amber-600" aria-hidden="true">*</span>}
      </label>
      {children}
    </div>
  );
}

function SummaryItem({
  label,
  value,
  capitalize,
}: {
  label: string;
  value?: string | number;
  capitalize?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-400">{label}</dt>
      <dd className={`text-sm font-semibold text-slate-800 ${capitalize ? "capitalize" : ""}`}>
        {value || "—"}
      </dd>
    </div>
  );
}

function coatLabel(coat?: CoatType): string {
  const labels: Record<CoatType, string> = {
    curly: "Curly 🐩",
    smooth: "Smooth 🐕",
    double: "Double 🐶",
    wire: "Wire 🦮",
    "long-silky": "Long & Silky 💇",
    hairless: "Hairless 🦂",
  };
  return coat ? labels[coat] : "—";
}
