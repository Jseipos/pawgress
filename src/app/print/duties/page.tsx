"use client";

import { useEffect, useState } from "react";
import { getKidProfile } from "@/lib/storage";
import type { KidProfile } from "@/lib/storage";
import "../../print/print.css";

export default function DutiesPage() {
  const [profile, setProfile] = useState<KidProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const p = await getKidProfile("default");
        if (cancelled) return;
        setProfile(p ?? null);
      } catch (err) {
        console.error("Duties load error:", err);
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
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading chart...</p>
      </div>
    );
  }

  const childName = profile?.childName || "Pet Guardian";
  const today = new Date();

  // Generate 14 days starting from today
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  });

  return (
    <div className="print-container">
      <h1 className="print-title" style={{ color: "#7c3aed" }}>
        📋 Daily Puppy Duties Chart
      </h1>
      <p className="print-subtitle">
        {childName}&apos;s 14-Day Pet Guardian Checklist
      </p>

      <table className="duties-chart">
        <thead>
          <tr>
            <th style={{ width: "25%" }}>Date</th>
            <th style={{ width: "18%" }}>🧸 Toys off floor</th>
            <th style={{ width: "18%" }}>🔌 Cords safe</th>
            <th style={{ width: "18%" }}>📏 Small things picked up</th>
            <th style={{ width: "18%" }}>🍎 Food swept</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day, i) => (
            <tr key={i}>
              <td style={{ fontWeight: "bold" }}>Day {i + 1}: {day}</td>
              <td>☐</td>
              <td>☐</td>
              <td>☐</td>
              <td>☐</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: "1in", textAlign: "center" }}>
        <p style={{ fontSize: "11pt", color: "#666" }}>
          Check each box after you finish the task. Come back every day! 🐾
        </p>
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
          🖨️ Print Chart
        </button>
      </div>
    </div>
  );
}
