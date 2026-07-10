"use client";

import { useState } from "react";
import type { GuardianPrefs } from "@/lib/storage";
import { saveGuardianPrefs } from "@/lib/storage";

interface GuardianArchiveProps {
  prefs: GuardianPrefs | null;
  petName: string;
  childName: string;
  onPrefsUpdate: (prefs: GuardianPrefs) => void;
  onClose: () => void;
}

const FORBIDDEN_FOODS: { emoji: string; name: string; danger: string }[] = [
  { emoji: "🍇", name: "Grapes", danger: "Can cause kidney failure" },
  { emoji: "🫐", name: "Raisins", danger: "Can cause kidney failure" },
  { emoji: "🍫", name: "Chocolate", danger: "Toxic — vomiting, seizures, death" },
  { emoji: "🍬", name: "Xylitol / Sugar-free gum", danger: "Deadly — severe blood sugar drop" },
  { emoji: "🧅", name: "Onions", danger: "Damages red blood cells" },
  { emoji: "🧄", name: "Garlic", danger: "Damages red blood cells" },
  { emoji: "🥑", name: "Avocado", danger: "Vomiting, diarrhea, heart damage" },
  { emoji: "🥜", name: "Macadamia nuts", danger: "Weakness, vomiting, tremors" },
  { emoji: "🍺", name: "Alcohol", danger: "Dangerous — coma, death" },
  { emoji: "☕", name: "Coffee / Caffeine", danger: "Restlessness, heart issues, death" },
  { emoji: "🍞", name: "Raw bread dough", danger: "Expands in stomach, toxic" },
  { emoji: "🦴", name: "Cooked bones", danger: "Splinter — internal injury" },
  { emoji: "🥓", name: "Fat trimmings", danger: "Pancreatitis" },
  { emoji: "🧂", name: "Salt", danger: "Excessive thirst, sodium poisoning" },
  { emoji: "🚬", name: "Tobacco", danger: "Nicotine poisoning" },
  { emoji: "💊", name: "Human medicine", danger: "Toxic — always ask vet first" },
];

type Tab = "promise" | "print" | "foods";

export default function GuardianArchive({
  prefs,
  petName,
  childName,
  onPrefsUpdate,
  onClose,
}: GuardianArchiveProps) {
  const [tab, setTab] = useState<Tab>("promise");
  const [foodSearch, setFoodSearch] = useState("");
  const [signed, setSigned] = useState(prefs?.promiseSigned ?? false);

  async function handleSignPromise() {
    const updated: GuardianPrefs = {
      id: "default",
      hasSeenIntro: prefs?.hasSeenIntro ?? true,
      promiseSigned: true,
      promiseText: promiseText,
      graduationComplete: prefs?.graduationComplete ?? false,
    };
    await saveGuardianPrefs(updated);
    setSigned(true);
    onPrefsUpdate(updated);
  }

  const promiseText = `I, ${childName}, promise to be a good Pet Guardian for ${petName}.
I will keep my home safe and clean.
I will pick up my toys and small things.
I will help keep cords and food away.
I will love and care for ${petName} every day.`;

  const filteredFoods = FORBIDDEN_FOODS.filter((f) =>
    f.name.toLowerCase().includes(foodSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-purple-200 bg-white/90 px-4 py-3 backdrop-blur-sm">
        <button
          onClick={onClose}
          className="rounded-lg px-3 py-2 text-lg font-semibold text-purple-500 hover:bg-purple-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold text-purple-700">📖 Guardian Archive</h1>
        <div className="w-16" aria-hidden />
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 px-4 py-3">
        <TabButton active={tab === "promise"} onClick={() => setTab("promise")} label="Promise" emoji="✋" />
        <TabButton active={tab === "print"} onClick={() => setTab("print")} label="Print" emoji="🖨️" />
        <TabButton active={tab === "foods"} onClick={() => setTab("foods")} label="Bad Foods" emoji="🚫" />
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-lg flex-1 px-4 pb-6">
        {tab === "promise" && (
          <div className="space-y-4">
            <div className="rounded-2xl border-4 border-purple-200 bg-white p-6 shadow-md">
              <h2 className="mb-4 text-center text-2xl font-bold text-purple-700">
                🐾 Pet Guardian Promise 🐾
              </h2>
              <p className="whitespace-pre-line text-center text-lg leading-relaxed text-purple-800">
                {promiseText}
              </p>
            </div>

            {signed ? (
              <div className="rounded-2xl border-4 border-green-300 bg-green-50 p-5 text-center">
                <span className="text-5xl" aria-hidden="true">✅</span>
                <p className="mt-2 text-xl font-bold text-green-700">
                  You signed the promise!
                </p>
                <p className="mt-1 text-green-600">
                  You are a true Pet Guardian! 🌟
                </p>
              </div>
            ) : (
              <button
                onClick={handleSignPromise}
                className="w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 py-5 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400"
                style={{ minHeight: "60px" }}
                aria-label="Sign the Pet Guardian Promise"
              >
                ✋ Tap to Sign Your Promise
              </button>
            )}
          </div>
        )}

        {tab === "print" && (
          <div className="space-y-3">
            <p className="text-center text-lg text-purple-500">
              Tap a button to open a printable page!
            </p>
            <PrintButton
              emoji="🎓"
              label="Pet Guardian Certificate"
              href="/print/certificate"
            />
            <PrintButton
              emoji="📋"
              label="Daily Puppy Duties Chart"
              href="/print/duties"
            />
            <PrintButton
              emoji="🍽️"
              label="Meal & Safe Treat Chart"
              href="/print/meal-chart"
            />
          </div>
        )}

        {tab === "foods" && (
          <div className="space-y-4">
            <div className="rounded-2xl border-4 border-red-200 bg-red-50 p-4 text-center">
              <span className="text-3xl" aria-hidden="true">🚫</span>
              <p className="mt-1 text-lg font-bold text-red-700">
                Foods that are BAD for {petName}
              </p>
              <p className="text-sm text-red-500">Never feed these to your pet!</p>
            </div>

            <input
              type="text"
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              placeholder="Search foods..."
              aria-label="Search forbidden foods"
              className="w-full rounded-xl border-2 border-purple-200 bg-white px-4 py-3 text-lg text-purple-800 placeholder:text-purple-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />

            <div className="space-y-2">
              {filteredFoods.map((food) => (
                <div
                  key={food.name}
                  className="flex items-center gap-3 rounded-xl border-2 border-red-100 bg-white p-3 shadow-sm"
                >
                  <span className="text-3xl" aria-hidden="true">{food.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-red-700">{food.name}</p>
                    <p className="text-sm text-red-500">{food.danger}</p>
                  </div>
                  <span className="text-2xl" aria-hidden="true">⚠️</span>
                </div>
              ))}
              {filteredFoods.length === 0 && (
                <p className="text-center text-purple-400">No foods found. Try another search!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={[
        "flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-3 transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400",
        active
          ? "border-purple-500 bg-purple-100 text-purple-700"
          : "border-purple-200 bg-white text-purple-500 hover:border-purple-400",
      ].join(" ")}
      style={{ minHeight: "60px" }}
    >
      <span className="text-2xl" aria-hidden="true">{emoji}</span>
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}

function PrintButton({ emoji, label, href }: { emoji: string; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center gap-4 rounded-2xl border-4 border-purple-200 bg-white p-5 shadow-md transition-all hover:border-purple-400 hover:bg-purple-50/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400"
      style={{ minHeight: "70px" }}
      aria-label={`Open printable ${label}`}
    >
      <span className="text-4xl" aria-hidden="true">{emoji}</span>
      <span className="flex-1 text-lg font-bold text-purple-700">{label}</span>
      <span className="text-2xl text-purple-400" aria-hidden="true">🖨️</span>
    </a>
  );
}
