"use client";

import { useState, useRef } from "react";
import type { PuppyProfile } from "@/lib/storage";
import {
  deleteAllData, exportAllData, importData, getProfile, saveProfile,
  getAllMilestones, saveMilestone, deleteMilestone, generateId,
} from "@/lib/storage";
import { generateMilestones } from "@/lib/milestones";
import { downloadIcs } from "@/lib/ics";

interface SettingsProps {
  profile: PuppyProfile | null;
  onProfileChanged: () => void;
  onDataReset: () => void;
}

export default function Settings({ profile, onProfileChanged, onDataReset }: SettingsProps) {
  const [confirming, setConfirming] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }

  // ─── Export ────────────────────────────────────────────────────────────────

  async function handleExport() {
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pawgress-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      flash("Data exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      flash("Export failed — try again");
    }
  }

  // ─── Import ────────────────────────────────────────────────────────────────

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importData(data);
      flash("Data imported successfully");
      onProfileChanged();
    } catch (err) {
      console.error("Import error:", err);
      flash("Import failed — check file format");
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  // ─── Reset ─────────────────────────────────────────────────────────────────

  async function handleReset() {
    try {
      await deleteAllData();
      flash("All data deleted");
      setConfirming(false);
      onDataReset();
    } catch (err) {
      console.error("Reset error:", err);
      flash("Reset failed — try again");
    }
  }

  // ─── Vet reminders .ics ────────────────────────────────────────────────────

  async function handleExportVetReminders() {
    if (!profile) return;
    const milestones = await getAllMilestones();
    const vetMilestones = milestones.filter((m) => m.category === "vet" && m.targetDate);

    if (vetMilestones.length === 0) {
      flash("No vet appointments to export");
      return;
    }

    downloadIcs(
      vetMilestones.map((m) => ({
        title: ` Vet: ${m.title}`,
        date: m.targetDate!,
        description: m.notes,
      })),
      "pawgress-vet-reminders.ics"
    );
    flash("Vet reminders exported to calendar");
  }

  // ─── Profile editing ──────────────────────────────────────────────────────

  if (editingProfile && profile) {
    return <ProfileEditor profile={profile} onSave={async (updated) => {
      await saveProfile(updated);
      setEditingProfile(false);
      onProfileChanged();
      flash("Profile updated");
    }} onCancel={() => setEditingProfile(false)} />;
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50 to-slate-100">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>

        {message && (
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {message}
          </div>
        )}

        {/* Profile section */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Pet Profile</h3>
          {profile ? (
            <>
              <div className="mb-3 space-y-1 text-sm text-slate-600">
                <p><strong className="text-slate-800">Name:</strong> {profile.puppyName}</p>
                <p><strong className="text-slate-800">Breed:</strong> {profile.breedName}</p>
                <p><strong className="text-slate-800">Coat:</strong> {profile.coatType}</p>
                <p><strong className="text-slate-800">Expected adult weight:</strong> {profile.expectedAdultWeightLbs} lbs</p>
                <p><strong className="text-slate-800">Training goals:</strong> {profile.trainingGoals.join(", ")}</p>
              </div>
              <button
                onClick={() => setEditingProfile(true)}
                className="rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">No profile set up yet.</p>
          )}
        </div>

        {/* Data management */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-slate-800">Data Management</h3>
          <div className="space-y-2">
            <button
              onClick={handleExport}
              className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <span className="text-lg mr-2" aria-hidden="true">📤</span>
              Export data (JSON backup)
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <span className="text-lg mr-2" aria-hidden="true">📥</span>
              Import data (restore backup)
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              className="hidden"
              aria-label="Import backup file"
            />

            <button
              onClick={handleExportVetReminders}
              disabled={!profile}
              className="w-full rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
            >
              <span className="text-lg mr-2" aria-hidden="true">📅</span>
              Export vet reminders (.ics calendar file)
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-slate-800">Privacy</h3>
          <p className="text-sm text-slate-600">
            All your data is stored locally on this device. Pawgress does not send any information to any server. No accounts, no tracking, no analytics.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Clearing your browser data will delete everything. Use the export feature to back up regularly.
          </p>
        </div>

        {/* About */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-slate-800">About</h3>
          <p className="text-sm text-slate-600">
            <strong className="text-slate-800">Pawgress</strong> — A local-first dog training and growth tracker.
          </p>
          <p className="mt-1 text-xs text-slate-400">Version 0.1.0 · Built with ❤️ for dog families</p>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50/50 p-5">
          <h3 className="mb-2 text-sm font-bold text-rose-800">Danger Zone</h3>
          <p className="mb-3 text-sm text-rose-600">
            Delete all data permanently. This cannot be undone.
          </p>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg border-2 border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              Delete All Data
            </button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border-2 border-rose-300 bg-white p-3">
                <p className="text-sm font-bold text-rose-800">Are you absolutely sure?</p>
                <p className="text-xs text-rose-600 mt-1">
                  This will delete your pet profile, all training sessions, weight entries, milestones, and guardian data. Export a backup first if you want to keep your data.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  Yes, Delete Everything
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Editor ───────────────────────────────────────────────────────────

function ProfileEditor({
  profile,
  onSave,
  onCancel,
}: {
  profile: PuppyProfile;
  onSave: (updated: PuppyProfile) => void;
  onCancel: () => void;
}) {
  const [puppyName, setPuppyName] = useState(profile.puppyName);
  const [breedName, setBreedName] = useState(profile.breedName);
  const [expectedAdultWeightLbs, setExpectedAdultWeightLbs] = useState(profile.expectedAdultWeightLbs.toString());
  const [feedingBrand, setFeedingBrand] = useState(profile.feedingBrand ?? "");
  const [temperamentNotes, setTemperamentNotes] = useState(profile.temperamentNotes ?? "");

  function handleSave() {
    const updated: PuppyProfile = {
      ...profile,
      puppyName: puppyName || profile.puppyName,
      breedName,
      expectedAdultWeightLbs: parseFloat(expectedAdultWeightLbs) || profile.expectedAdultWeightLbs,
      feedingBrand: feedingBrand || undefined,
      temperamentNotes: temperamentNotes || undefined,
    };
    onSave(updated);
  }

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-amber-50 to-slate-100">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
          <button
            onClick={onCancel}
            className="text-sm font-semibold text-slate-400 hover:text-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
          >
            ← Back
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="puppy-name">Pet Name</label>
            <input
              id="puppy-name"
              type="text"
              value={puppyName}
              onChange={(e) => setPuppyName(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
              aria-label="Pet name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="breed-name">Breed</label>
            <input
              id="breed-name"
              type="text"
              value={breedName}
              onChange={(e) => setBreedName(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
              aria-label="Breed name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="adult-weight">Expected Adult Weight (lbs)</label>
            <input
              id="adult-weight"
              type="number"
              step="0.1"
              value={expectedAdultWeightLbs}
              onChange={(e) => setExpectedAdultWeightLbs(e.target.value)}
              className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-slate-900 focus:border-amber-500 focus:outline-none"
              aria-label="Expected adult weight in pounds"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="feeding-brand">Current Food Brand</label>
            <input
              id="feeding-brand"
              type="text"
              value={feedingBrand}
              onChange={(e) => setFeedingBrand(e.target.value)}
              placeholder="e.g., Purina Pro Plan Puppy"
              className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
              aria-label="Current food brand"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700" htmlFor="temperament-notes">Temperament Notes</label>
            <textarea
              id="temperament-notes"
              value={temperamentNotes}
              onChange={(e) => setTemperamentNotes(e.target.value)}
              placeholder="e.g., Curious but cautious with new people, high energy..."
              rows={3}
              className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
              aria-label="Temperament notes"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onCancel}
              className="rounded-lg border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-full bg-amber-500 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
