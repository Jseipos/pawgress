"use client";

import { useState } from "react";
import type { KidProfile, MascotType } from "@/lib/storage";
import { saveKidProfile } from "@/lib/storage";

interface KidAccessSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

import { hasMascotImage, getMascotImage } from "@/components/Mascot";

const MASCOT_OPTIONS: { value: MascotType; emoji: string; label: string }[] = [
  { value: "ayla", emoji: "🧒", label: "Ayla" },
  { value: "flame", emoji: "🔥", label: "Flame" },
  { value: "star", emoji: "⭐", label: "Star" },
  { value: "heart", emoji: "❤️", label: "Heart" },
  { value: "rocket", emoji: "🚀", label: "Rocket" },
  { value: "paw", emoji: "🐾", label: "Paw" },
];

const STEPS = [
  { id: 0, title: "Set Up Child Access", emoji: "👶" },
  { id: 1, title: "Child Name", emoji: "✏️" },
  { id: 2, title: "PIN Code", emoji: "🔐" },
  { id: 3, title: "Pick a Mascot", emoji: "🎭" },
  { id: 4, title: "Pet Arrival Date", emoji: "📅" },
  { id: 5, title: "All Ready!", emoji: "🎉" },
];

export default function KidAccessSetup({ onComplete, onCancel }: KidAccessSetupProps) {
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [usePin, setUsePin] = useState(false);
  const [mascot, setMascot] = useState<MascotType | null>(null);
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  function handleNext() {
    setError(null);

    if (step === 1 && childName.trim() === "") {
      setError("Please enter your child's name");
      return;
    }

    if (step === 2 && usePin) {
      if (!/^\d{4}$/.test(pin)) {
        setError("PIN must be exactly 4 digits");
        return;
      }
      if (pin !== pinConfirm) {
        setError("PINs do not match");
        return;
      }
    }

    if (step === 3 && !mascot) {
      setError("Please pick a mascot");
      return;
    }

    if (step === 4 && !targetDate) {
      setError("Please pick a date");
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    setError(null);
    if (step > 0) setStep(step - 1);
  }

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      const profile: KidProfile = {
        id: "default",
        childName: childName.trim(),
        pin: usePin ? pin : undefined,
        mascot: mascot!,
        targetDate,
        createdAt: new Date().toISOString(),
      };
      await saveKidProfile(profile);
      setStep(5);
    } catch (err) {
      console.error("KidAccessSetup save error:", err);
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ─── Summary step (step 5) ─────────────────────────────────────
  if (step === 5) {
    const selectedMascot = MASCOT_OPTIONS.find((m) => m.value === mascot);
    return (
      <div className="space-y-4">
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6 text-center">
          {mascot && hasMascotImage(mascot) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getMascotImage(mascot)!}
              alt={selectedMascot?.label ?? "mascot"}
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-300 shadow-sm mx-auto"
            />
          ) : (
            <span className="text-5xl" aria-hidden="true">{selectedMascot?.emoji}</span>
          )}
          <h2 className="mt-2 text-2xl font-bold text-amber-800">All Ready!</h2>
          <p className="mt-1 text-amber-700">
            {childName} can now visit <strong>/guardian</strong> to start their prep adventure!
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Child Name</dt>
              <dd className="font-semibold text-slate-800">{childName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Mascot</dt>
              <dd className="font-semibold text-slate-800">{selectedMascot?.label}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">PIN</dt>
              <dd className="font-semibold text-slate-800">{usePin ? "🔒 Set" : "No PIN"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-slate-400">Pet Arrival</dt>
              <dd className="font-semibold text-slate-800">
                {new Date(targetDate + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </dd>
            </div>
          </dl>
        </div>

        <button
          onClick={onComplete}
          className="w-full rounded-full bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          aria-label="Done"
        >
          Done ✓
        </button>
      </div>
    );
  }

  // ─── Main flow ─────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 bg-white/90 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={step === 0 ? onCancel : handleBack}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="Go back"
          >
            ← {step === 0 ? "Cancel" : "Back"}
          </button>
          <span className="text-sm font-semibold text-slate-600">
            Step {step + 1} of {STEPS.length}
          </span>
          <div className="w-16" aria-hidden />
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Setup progress"
          />
        </div>
      </div>

      {/* Step content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">{STEPS[step].emoji}</span>
          <h2 className="text-xl font-bold text-slate-900">{STEPS[step].title}</h2>
        </div>

        {/* Step 0: Intro */}
        {step === 0 && (
          <div className="space-y-3">
            <p className="text-slate-600">
              Set up your child&apos;s account so they can use the <strong>Junior Guardian</strong> mode
              at <code className="rounded bg-slate-100 px-1 text-sm">/guardian</code>.
            </p>
            <p className="text-slate-600">
              They&apos;ll get a fun, simple checklist to build pet-prep habits — picking up toys,
              securing cords, and more. You can view their progress from this dashboard anytime.
            </p>
            <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-3">
              <p className="text-sm text-amber-800">
                💡 <strong>Privacy:</strong> All data stays on this device. No server, no sync.
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Child name */}
        {step === 1 && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Child&apos;s name
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g., Emma"
              aria-label="Child's name"
              autoFocus
              className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Step 2: PIN */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setUsePin(false)}
                aria-pressed={!usePin}
                className={[
                  "flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                  !usePin
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-amber-300",
                ].join(" ")}
              >
                No PIN needed
              </button>
              <button
                onClick={() => setUsePin(true)}
                aria-pressed={usePin}
                className={[
                  "flex-1 rounded-lg border-2 py-3 text-sm font-semibold transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                  usePin
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-amber-300",
                ].join(" ")}
              >
                Use a 4-digit PIN
              </button>
            </div>

            {usePin && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Enter 4-digit PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    aria-label="4-digit PIN"
                    className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-2xl tracking-widest text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Confirm PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pinConfirm}
                    onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    aria-label="Confirm 4-digit PIN"
                    className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-2xl tracking-widest text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  The PIN is optional. It&apos;s stored locally and only on this device.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Mascot */}
        {step === 3 && (
          <div>
            <p className="mb-3 text-sm text-slate-600">
              Pick a mascot character for {childName || "your child"}.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {MASCOT_OPTIONS.map((opt) => {
                const imgSrc = hasMascotImage(opt.value) ? getMascotImage(opt.value) : null;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setMascot(opt.value)}
                    aria-pressed={mascot === opt.value}
                    aria-label={opt.label}
                    className={[
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                      mascot === opt.value
                        ? "border-amber-500 bg-amber-50 shadow-md"
                        : "border-slate-200 bg-white hover:border-amber-300",
                    ].join(" ")}
                  >
                    {imgSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imgSrc}
                        alt={opt.label}
                        className="w-12 h-12 rounded-full object-cover border border-amber-200"
                      />
                    ) : (
                      <span className="text-4xl" aria-hidden="true">{opt.emoji}</span>
                    )}
                    <span className="text-sm font-semibold text-slate-700">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Target date */}
        {step === 4 && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              When does the pet arrive?
            </label>
            <p className="mb-3 text-sm text-slate-500">
              This is the target date for the 14-day countdown.
            </p>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              aria-label="Pet arrival date"
              className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Next/Create button */}
      <button
        onClick={step === 4 ? handleCreate : handleNext}
        disabled={saving || (step === 1 && !childName.trim()) || (step === 2 && usePin && (!pin || !pinConfirm)) || (step === 3 && !mascot) || (step === 4 && !targetDate)}
        className="w-full rounded-full bg-amber-500 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        aria-label={step === 4 ? "Create child profile" : "Continue"}
      >
        {saving ? "Saving..." : step === 4 ? "Create Profile 🎉" : "Next →"}
      </button>
    </div>
  );
}
