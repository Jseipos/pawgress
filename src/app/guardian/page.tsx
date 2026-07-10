"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  KidProfile,
  GuardianLog,
  GuardianBadge,
  GuardianPrefs,
  PuppyProfile,
} from "@/lib/storage";
import {
  getKidProfile,
  getAllGuardianLogs,
  getAllGuardianBadges,
  getGuardianPrefs,
  saveGuardianPrefs,
  saveGuardianLog,
  saveGuardianBadge,
  getProfile,
  calculateStreak,
  checkAndAwardBadges,
  daysUntilTarget,
  todayISODate,
  generateId,
} from "@/lib/storage";
import GuardianChecklist, { type ChecklistItems } from "@/components/GuardianChecklist";
import StreakTracker from "@/components/StreakTracker";
import MilestoneMeter from "@/components/MilestoneMeter";
import GuardianArchive from "@/components/GuardianArchive";
import { getMascotEmoji, hasMascotImage, getMascotImage } from "@/components/Mascot";

type Screen =
  | "loading"
  | "noProfile"
  | "intro"
  | "dashboard"
  | "checklist"
  | "celebration"
  | "graduation"
  | "archive";



export default function GuardianPage() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [kidProfile, setKidProfile] = useState<KidProfile | null>(null);
  const [petProfile, setPetProfile] = useState<PuppyProfile | null>(null);
  const [logs, setLogs] = useState<GuardianLog[]>([]);
  const [badges, setBadges] = useState<GuardianBadge[]>([]);
  const [prefs, setPrefs] = useState<GuardianPrefs | null>(null);
  const [streak, setStreak] = useState(0);
  const [celebrationBadges, setCelebrationBadges] = useState<GuardianBadge[]>([]);
  const [newStreak, setNewStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ─── Load on mount ──────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [profile, pet, allLogs, allBadges, gprefs] = await Promise.all([
          getKidProfile("default"),
          getProfile("default"),
          getAllGuardianLogs(),
          getAllGuardianBadges(),
          getGuardianPrefs("default"),
        ]);

        if (cancelled) return;

        setKidProfile(profile ?? null);
        setPetProfile(pet ?? null);
        setLogs(allLogs);
        setBadges(allBadges);
        setPrefs(gprefs ?? null);

        if (!profile) {
          setScreen("noProfile");
          return;
        }

        const currentStreak = calculateStreak(allLogs);
        setStreak(currentStreak);

        if (!gprefs || !gprefs.hasSeenIntro) {
          setScreen("intro");
        } else {
          setScreen("dashboard");
        }
      } catch (err) {
        console.error("Guardian init error:", err);
        if (!cancelled) {
          setError("Could not load your data. Please refresh.");
          setScreen("noProfile");
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const petName = petProfile?.puppyName || "your new pet";
  const mascotType = kidProfile?.mascot ?? "ayla";
  const mascotEmoji = getMascotEmoji(mascotType);
  const mascotImg = hasMascotImage(mascotType) ? getMascotImage(mascotType) : null;
  const daysLeft = kidProfile ? daysUntilTarget(kidProfile.targetDate) : 0;
  const today = todayISODate();
  const alreadyLoggedToday = logs.some((l) => l.date === today && l.checklistComplete);
  const completedDays = logs.filter((l) => l.checklistComplete).length;

  // ─── Handlers ───────────────────────────────────────────────────────────

  async function handleIntroStart() {
    const newPrefs: GuardianPrefs = {
      id: "default",
      hasSeenIntro: true,
      promiseSigned: prefs?.promiseSigned ?? false,
      promiseText: prefs?.promiseText,
      graduationComplete: prefs?.graduationComplete ?? false,
    };
    try {
      await saveGuardianPrefs(newPrefs);
      setPrefs(newPrefs);
      setScreen("dashboard");
    } catch (err) {
      console.error("Save prefs error:", err);
      setScreen("dashboard");
    }
  }

  async function handleChecklistComplete(items: ChecklistItems) {
    if (!kidProfile) return;

    try {
      // Calculate new streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const sortedLogs = [...logs].sort((a, b) => b.date.localeCompare(a.date));
      const lastLog = sortedLogs[0];

      let newStreakVal: number;
      if (lastLog && (lastLog.date === yesterdayStr || lastLog.date === today)) {
        if (lastLog.date === today && lastLog.checklistComplete) {
          // Already logged today — shouldn't happen since UI prevents it, but be safe
          newStreakVal = lastLog.streakAtLog;
        } else {
          newStreakVal = lastLog.streakAtLog + 1;
        }
      } else {
        newStreakVal = 1;
      }

      const newLog: GuardianLog = {
        id: generateId(),
        date: today,
        checklistComplete: true,
        items,
        streakAtLog: newStreakVal,
      };

      await saveGuardianLog(newLog);

      const updatedLogs = [...logs, newLog];
      setLogs(updatedLogs);
      setNewStreak(newStreakVal);
      setStreak(newStreakVal);

      // Check for new badges
      const logCount = updatedLogs.length;
      const newBadges = checkAndAwardBadges(newStreakVal, badges, logCount);

      if (newBadges.length > 0) {
        await Promise.all(newBadges.map((b) => saveGuardianBadge(b)));
        setCelebrationBadges(newBadges);
        setBadges([...badges, ...newBadges]);
      } else {
        setCelebrationBadges([]);
      }

      // Check for graduation
      if (newStreakVal >= 14 && !(prefs?.graduationComplete)) {
        const gradPrefs: GuardianPrefs = {
          id: "default",
          hasSeenIntro: true,
          promiseSigned: prefs?.promiseSigned ?? false,
          promiseText: prefs?.promiseText,
          graduationComplete: true,
        };
        await saveGuardianPrefs(gradPrefs);
        setPrefs(gradPrefs);
        setScreen("graduation");
      } else {
        setScreen("celebration");
      }
    } catch (err) {
      console.error("Checklist complete error:", err);
      setError("Could not save your tasks. Please try again.");
    }
  }

  function handleBackToDashboard() {
    setScreen("dashboard");
    setCelebrationBadges([]);
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  // Loading
  if (screen === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl animate-pulse" aria-hidden="true">🐾</span>
          <p className="text-purple-500">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 px-6">
        <div className="text-center">
          <span className="text-4xl" aria-hidden="true">⚠️</span>
          <p className="mt-2 text-purple-700">{error}</p>
        </div>
      </div>
    );
  }

  // No profile
  if (screen === "noProfile") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 px-6 py-12">
        <span className="text-6xl" aria-hidden="true">🐾</span>
        <h1 className="mt-4 text-3xl font-bold text-purple-700">Junior Guardian</h1>
        <p className="mt-2 max-w-sm text-center text-lg text-purple-500">
          Ask a grown-up to set up your account in the Pawgress app first!
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-purple-500 px-6 py-3 text-lg font-bold text-white shadow-lg transition-all hover:bg-purple-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          Go to Pawgress 🐾
        </Link>
      </div>
    );
  }

  // Intro screen
  if (screen === "intro" && kidProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 px-6 py-12">
        {mascotImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mascotImg}
            alt={`${kidProfile.childName}'s mascot`}
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 shadow-lg"
          />
        ) : (
          <span className="text-8xl" aria-hidden="true">{mascotEmoji}</span>
        )}
        <h1 className="mt-6 text-4xl font-bold text-purple-700">
          Hi {kidProfile.childName}!
        </h1>
        <p className="mt-3 max-w-md text-center text-xl text-purple-600">
          Let&apos;s get ready for {petName}! 🐶
        </p>
        <p className="mt-2 max-w-sm text-center text-lg text-purple-500">
          You&apos;ll do 4 quick tasks every day to make your home safe and cozy for your new pet.
          Complete 14 days to become a Pet Guardian Champion!
        </p>
        <button
          onClick={handleIntroStart}
          className="mt-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-xl font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400"
          style={{ minHeight: "60px" }}
          aria-label="Start your prep adventure"
        >
          Start your adventure! 🚀
        </button>
      </div>
    );
  }

  // Checklist screen
  if (screen === "checklist") {
    return (
      <GuardianChecklist
        onComplete={handleChecklistComplete}
        onCancel={handleBackToDashboard}
      />
    );
  }

  // Celebration screen
  if (screen === "celebration") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-50 to-pink-50 px-6 py-12">
        {/* Emoji burst */}
        <div className="mb-6 flex gap-2 text-5xl" aria-hidden="true">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>🎉</span>
          <span className="animate-bounce" style={{ animationDelay: "150ms" }}>🌟</span>
          <span className="animate-bounce" style={{ animationDelay: "300ms" }}>🎊</span>
          <span className="animate-bounce" style={{ animationDelay: "450ms" }}>⭐</span>
          <span className="animate-bounce" style={{ animationDelay: "600ms" }}>🎈</span>
        </div>

        <h1 className="text-5xl font-bold text-purple-700">YAY!</h1>
        <p className="mt-4 text-2xl font-semibold text-purple-600">
          You did all your tasks today! 🌟
        </p>

        {/* Streak display */}
        <div className="mt-6 flex items-center gap-2">
          <span className="text-5xl" aria-hidden="true">🔥</span>
          <span className="text-4xl font-bold text-purple-700">{newStreak}</span>
          <span className="text-xl text-purple-500">
            day{newStreak !== 1 ? "s" : ""} in a row!
          </span>
        </div>

        {/* New badges */}
        {celebrationBadges.length > 0 && (
          <div className="mt-8 rounded-2xl border-4 border-yellow-300 bg-yellow-50 p-6 text-center">
            <h2 className="text-2xl font-bold text-purple-700">New Badge! 🏆</h2>
            <div className="mt-3 flex justify-center gap-3">
              {celebrationBadges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center">
                  <span className="text-6xl" aria-hidden="true">
                    {badge.type === "first-log" ? "🌟" :
                     badge.type === "streak-3" ? "🥉" :
                     badge.type === "streak-7" ? "🥈" :
                     badge.type === "streak-14" ? "🥇" :
                     badge.type === "graduation" ? "🎓" : "🏆"}
                  </span>
                  <span className="mt-1 text-sm font-bold text-purple-700">
                    {badge.type === "first-log" ? "First Log!" :
                     badge.type === "streak-3" ? "3 Days!" :
                     badge.type === "streak-7" ? "7 Days!" :
                     badge.type === "streak-14" ? "14 Days!" :
                     badge.type === "graduation" ? "Graduate!" : badge.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleBackToDashboard}
          className="mt-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-xl font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400"
          style={{ minHeight: "60px" }}
          aria-label="Back to dashboard"
        >
          Awesome! ←
        </button>
      </div>
    );
  }

  // Graduation screen
  if (screen === "graduation" && kidProfile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-100 to-pink-100 px-6 py-12">
        {/* Graduation cap */}
        <div className="mb-6 flex gap-3 text-6xl" aria-hidden="true">
          <span className="animate-bounce" style={{ animationDelay: "0ms" }}>🎓</span>
          <span className="animate-bounce" style={{ animationDelay: "200ms" }}>🎉</span>
          <span className="animate-bounce" style={{ animationDelay: "400ms" }}>🏆</span>
        </div>

        <h1 className="text-5xl font-bold text-purple-700">
          You did it, {kidProfile.childName}!
        </h1>
        <p className="mt-4 max-w-md text-center text-xl text-purple-600">
          You completed 14 days of Pet Guardian training!
          You are now a <strong>Pet Guardian Champion</strong>! 🏆
        </p>

        {/* Certificate preview */}
        <div className="mt-8 rounded-2xl border-4 border-purple-300 bg-white p-8 shadow-xl">
          <div className="text-center">
            <span className="text-5xl" aria-hidden="true">🎓</span>
            <h2 className="mt-2 text-2xl font-bold text-purple-700">
              Pet Guardian Certificate
            </h2>
            <p className="mt-2 text-lg text-slate-700">
              This certifies that
            </p>
            <p className="text-3xl font-bold text-purple-600">{kidProfile.childName}</p>
            <p className="mt-2 text-lg text-slate-700">
              has completed 14 days of Pet Guardian training
              and is ready to welcome {petName}! 🐾
            </p>
          </div>
        </div>

        {/* Print certificate */}
        <a
          href="/print/certificate"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 text-xl font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400"
          style={{ minHeight: "60px" }}
          aria-label="Print your certificate"
        >
          🖨️ Print My Certificate
        </a>

        <button
          onClick={handleBackToDashboard}
          className="mt-4 rounded-full px-6 py-3 text-lg font-semibold text-purple-400 hover:text-purple-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          aria-label="Back to dashboard"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  // Archive screen
  if (screen === "archive" && kidProfile) {
    return (
      <GuardianArchive
        prefs={prefs}
        petName={petName}
        childName={kidProfile.childName}
        onPrefsUpdate={setPrefs}
        onClose={handleBackToDashboard}
      />
    );
  }

  // Dashboard (main screen)
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Greeting */}
        <div className="mb-6 text-center">
          {mascotImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mascotImg}
              alt={`${kidProfile?.childName}'s mascot`}
              className="w-20 h-20 rounded-full object-cover border-2 border-purple-200 shadow-sm mx-auto"
            />
          ) : (
            <span className="text-6xl" aria-hidden="true">{mascotEmoji}</span>
          )}
          <h1 className="mt-2 text-3xl font-bold text-purple-700">
            Hi {kidProfile?.childName}!
          </h1>
          {daysLeft > 0 ? (
            <p className="mt-1 text-xl text-purple-500">
              {petName} arrives in <span className="font-bold text-purple-700">{daysLeft}</span> day{daysLeft !== 1 ? "s" : ""}! 🐶
            </p>
          ) : (
            <p className="mt-1 text-xl text-purple-500">
              {petName} is here! 🎉🐶
            </p>
          )}
        </div>

        {/* Already logged today */}
        {alreadyLoggedToday ? (
          <div className="mb-6 rounded-2xl border-4 border-green-300 bg-green-50 p-6 text-center">
            <span className="text-5xl" aria-hidden="true">🌟</span>
            <p className="mt-2 text-xl font-bold text-green-700">
              You already did your tasks today!
            </p>
            <p className="mt-1 text-green-600">Come back tomorrow! 🌙</p>
          </div>
        ) : (
          /* Big log button */
          <button
            onClick={() => setScreen("checklist")}
            className="mb-6 w-full rounded-3xl bg-gradient-to-r from-purple-500 to-pink-500 py-8 text-2xl font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400 focus-visible:ring-offset-2"
            style={{ minHeight: "80px" }}
            aria-label="Log today's tasks"
          >
            📋 Log Today&apos;s Tasks!
          </button>
        )}

        {/* Streak tracker */}
        <div className="mb-4">
          <StreakTracker streak={streak} badges={badges} />
        </div>

        {/* Milestone meter */}
        <div className="mb-4">
          <MilestoneMeter
            daysCompleted={completedDays}
            totalDays={14}
            petName={petName}
          />
        </div>

        {/* Archive button */}
        <button
          onClick={() => setScreen("archive")}
          className="w-full rounded-2xl border-4 border-purple-200 bg-white py-4 text-lg font-bold text-purple-600 shadow-md transition-all hover:border-purple-400 hover:bg-purple-50/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400"
          style={{ minHeight: "60px" }}
          aria-label="Open Guardian Archive"
        >
          📖 Guardian Archive
        </button>

        {/* Parent link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-purple-400 hover:text-purple-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded px-2 py-1"
            aria-label="Go to parent app"
          >
            Grown-up? Go to Pawgress →
          </Link>
        </div>
      </div>
    </div>
  );
}
