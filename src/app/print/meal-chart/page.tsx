"use client";

import { useEffect, useState } from "react";
import { getKidProfile } from "@/lib/storage";
import type { KidProfile } from "@/lib/storage";
import "../../print/print.css";

const SAFE_FOODS: { emoji: string; name: string; note: string }[] = [
  { emoji: "🥕", name: "Carrots", note: "Raw or cooked, great snack" },
  { emoji: "🍎", name: "Apples", note: "Remove seeds first" },
  { emoji: "🫐", name: "Blueberries", note: "Antioxidant treat" },
  { emoji: "🍌", name: "Bananas", note: "In moderation" },
  { emoji: "🍗", name: "Plain chicken", note: "Cooked, no bones" },
  { emoji: "🍚", name: "Plain rice", note: "Good for upset tummy" },
  { emoji: "🍠", name: "Sweet potato", note: "Cooked, plain" },
  { emoji: "🥒", name: "Cucumbers", note: "Low calorie crunch" },
  { emoji: "🥚", name: "Eggs", note: "Cooked, no salt" },
  { emoji: "🐟", name: "Salmon", note: "Cooked, boneless" },
  { emoji: "🎃", name: "Pumpkin", note: "Great for digestion" },
  { emoji: "🥦", name: "Broccoli", note: "Small amounts" },
];

const FORBIDDEN_FOODS: { emoji: string; name: string; danger: string }[] = [
  { emoji: "🍇", name: "Grapes & Raisins", danger: "Kidney failure" },
  { emoji: "🍫", name: "Chocolate", danger: "Toxic — seizures, death" },
  { emoji: "🍬", name: "Xylitol / Gum", danger: "Deadly blood sugar drop" },
  { emoji: "🧅", name: "Onions", danger: "Red blood cell damage" },
  { emoji: "🧄", name: "Garlic", danger: "Red blood cell damage" },
  { emoji: "🥑", name: "Avocado", danger: "Vomiting, heart damage" },
  { emoji: "🥜", name: "Macadamia nuts", danger: "Weakness, tremors" },
  { emoji: "🍺", name: "Alcohol", danger: "Coma, death" },
  { emoji: "☕", name: "Caffeine", danger: "Heart issues, death" },
  { emoji: "🦴", name: "Cooked bones", danger: "Internal injury" },
  { emoji: "🥓", name: "Fat trimmings", danger: "Pancreatitis" },
  { emoji: "🧂", name: "Excess salt", danger: "Sodium poisoning" },
];

export default function MealChartPage() {
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
        console.error("Meal chart load error:", err);
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

  return (
    <div className="print-container">
      <h1 className="print-title" style={{ color: "#7c3aed" }}>
        🍽️ Meal & Safe Treat Chart
      </h1>
      <p className="print-subtitle">
        For {childName} and their puppy
      </p>

      {/* Safe foods */}
      <h2 style={{ color: "#16a34a", fontSize: "18pt", marginTop: "0.5in", marginBottom: "0.2in" }}>
        ✅ Safe Treats (in moderation)
      </h2>
      <div style={{ marginBottom: "0.5in" }}>
        {SAFE_FOODS.map((food) => (
          <div key={food.name} className="food-chart-item">
            <span className="food-chart-emoji" aria-hidden="true">{food.emoji}</span>
            <div>
              <strong>{food.name}</strong> — {food.note}
            </div>
          </div>
        ))}
      </div>

      {/* Forbidden foods */}
      <h2 style={{ color: "#dc2626", fontSize: "18pt", marginTop: "0.5in", marginBottom: "0.2in" }}>
        🚫 NEVER Feed These!
      </h2>
      <div>
        {FORBIDDEN_FOODS.map((food) => (
          <div key={food.name} className="food-chart-item">
            <span className="food-chart-emoji" aria-hidden="true">{food.emoji}</span>
            <div>
              <strong>{food.name}</strong> — {food.danger}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "0.5in", textAlign: "center" }}>
        <p style={{ fontSize: "11pt", color: "#666" }}>
          When in doubt, ask a grown-up or a vet! 🐾
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
