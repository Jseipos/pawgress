import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Pawgress",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-sm text-slate-700">
          <section>
            <h2 className="text-lg font-bold text-slate-900">No Server. No Cloud. No Accounts.</h2>
            <p className="mt-1">
              Pawgress is a local-first application. All your data — pet profile, training sessions, weight entries, milestones, supply checklists, socialization tracking, and guardian logs — is stored entirely in your browser using IndexedDB. No data ever leaves your device.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">No Tracking. No Analytics. No Telemetry.</h2>
            <p className="mt-1">
              Pawgress does not include any analytics SDKs, tracking pixels, or telemetry. We do not collect usage data, crash reports, or device information. There are no cookies. There is no server to log your activity.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Your Data Is Yours</h2>
            <p className="mt-1">
              You can export your complete data as a JSON file at any time from Settings. You can delete all data permanently from Settings. Clearing your browser storage will also delete all Pawgress data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Offline by Design</h2>
            <p className="mt-1">
              Pawgress works without an internet connection. Once loaded, the app runs entirely in your browser. You can add it to your home screen for app-like offline access.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">What This Means</h2>
            <ul className="mt-1 list-disc pl-5 space-y-1">
              <li>No one can access your data without physical access to your device</li>
              <li>Switching devices requires exporting from your old device and importing to the new one</li>
              <li>Clearing browser data = data loss. Back up regularly using the export feature</li>
              <li>No one can recover your data if you lose it</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Kids Side (Junior Guardian)</h2>
            <p className="mt-1">
              The Junior Guardian side is equally private. Child names, PINs, and activity logs are stored locally on the device only. No child data is transmitted anywhere.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">Open Source</h2>
            <p className="mt-1">
              Pawgress is open and auditable. You can inspect the source code to verify these claims at any time.
            </p>
          </section>

          <p className="pt-4 text-xs text-slate-400 border-t border-slate-100">
            Pawgress v0.1.0 — Last updated July 2026
          </p>
        </div>

        <Link
          href="/"
          className="inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          ← Back to Pawgress
        </Link>
      </div>
    </div>
  );
}
