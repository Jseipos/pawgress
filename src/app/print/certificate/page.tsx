"use client";

import { useEffect, useState } from "react";
import { getKidProfile, getAllGuardianBadges } from "@/lib/storage";
import type { KidProfile, GuardianBadge } from "@/lib/storage";
import "../../print/print.css";

export default function CertificatePage() {
  const [profile, setProfile] = useState<KidProfile | null>(null);
  const [badges, setBadges] = useState<GuardianBadge[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [p, b] = await Promise.all([
          getKidProfile("default"),
          getAllGuardianBadges(),
        ]);
        if (cancelled) return;
        setProfile(p ?? null);
        setBadges(b);
      } catch (err) {
        console.error("Certificate load error:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      // Auto-trigger print dialog
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading certificate...</p>
      </div>
    );
  }

  const childName = profile?.childName || "Pet Guardian";
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasGraduated = badges.some((b) => b.type === "graduation");

  return (
    <div className="print-container">
      <div className="certificate-border">
        <div style={{ fontSize: "48pt", textAlign: "center" }} aria-hidden="true">🎓</div>
        <h1 className="print-title" style={{ color: "#7c3aed" }}>
          Pet Guardian Certificate
        </h1>
        <p className="print-subtitle">This certifies that</p>
        <div className="certificate-name">{childName}</div>
        <p className="print-subtitle">
          has completed 14 days of Pet Guardian training
          and is ready to welcome a new puppy into their home.
        </p>
        <div style={{ textAlign: "center", margin: "0.5in 0" }} aria-hidden="true">
          🐾 🐾 🐾
        </div>
        {hasGraduated && (
          <p style={{ textAlign: "center", fontSize: "16pt", fontWeight: "bold" }}>
            ✅ Pet Guardian Champion
          </p>
        )}
        <div style={{ marginTop: "0.5in", textAlign: "center" }}>
          <p style={{ fontSize: "11pt", color: "#666" }}>Date: {today}</p>
          <p style={{ fontSize: "10pt", color: "#999", marginTop: "0.2in" }}>
            Pawgress — Junior Guardian Program
          </p>
        </div>
      </div>

      {/* Print button (screen only) */}
      <div className="no-print" style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "12px 32px",
            fontSize: "16px",
            fontWeight: "bold",
            backgroundColor: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🖨️ Print Certificate
        </button>
      </div>
    </div>
  );
}
