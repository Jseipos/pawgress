"use client";

import { useState, useEffect } from "react";
import type { SupplyItem, SupplyCategory, StageNeeded, PuppyProfile } from "@/lib/storage";
import { getAllSupplies, saveSupply, generateId } from "@/lib/storage";

interface SupplyChecklistProps {
  profile: PuppyProfile;
}

interface SupplyTemplate {
  category: SupplyCategory;
  label: string;
  description: string;
  stageNeeded: StageNeeded;
  required: boolean;
}

// ─── Supply templates by life stage ───────────────────────────────────────────

const PUPPY_SUPPLIES: SupplyTemplate[] = [
  { category: "essentials", label: "Crate + divider", description: "Safe space, potty training tool, travel. Size based on expected adult weight.", stageNeeded: "puppy", required: true },
  { category: "essentials", label: "Adjustable collar + 6ft leash", description: "ID tag on collar at all times. Adjust as puppy grows.", stageNeeded: "puppy", required: true },
  { category: "essentials", label: "ID tag", description: "Name + phone number. Get this before bringing puppy home.", stageNeeded: "puppy", required: true },
  { category: "essentials", label: "Stainless steel bowls", description: "Two: one for water, one for food. Non-slip bottom.", stageNeeded: "puppy", required: true },
  { category: "essentials", label: "Crate bed (washable)", description: "Comfortable but washable — accidents happen.", stageNeeded: "puppy", required: true },
  { category: "essentials", label: "Baby gates", description: "Block off rooms, keep puppy in safe area.", stageNeeded: "puppy", required: false },
  { category: "essentials", label: "Exercise pen (ex-pen)", description: "Safe enclosed area when not in crate.", stageNeeded: "puppy", required: false },

  { category: "feeding", label: "Puppy food (breeder's brand)", description: "Start with what breeder feeds. Transition slowly if switching.", stageNeeded: "puppy", required: true },
  { category: "feeding", label: "Training treats", description: "Small, soft, high-value. Single-ingredient if possible.", stageNeeded: "puppy", required: true },
  { category: "feeding", label: "Treat pouch", description: "Keeps treats accessible during training sessions.", stageNeeded: "puppy", required: false },
  { category: "feeding", label: "Puzzle feeder", description: "Mental stimulation, slows down eating.", stageNeeded: "puppy", required: false },
  { category: "feeding", label: "Puppy pads", description: "For early potty training stage. Phasing out as puppy learns.", stageNeeded: "puppy", required: false },

  { category: "training", label: "Clicker", description: "Optional but helpful for marking behaviors precisely.", stageNeeded: "puppy", required: false },
  { category: "training", label: "Long line (15-30ft)", description: "For recall training outdoors before off-leash is safe.", stageNeeded: "adolescent", required: false },
  { category: "training", label: "Front-clip harness", description: "Reduces pulling. Better than back-clip for pullers.", stageNeeded: "adolescent", required: false },

  { category: "grooming", label: "Enzymatic cleaner", description: "Removes urine scent so puppy doesn't re-mark. Regular cleaners don't work.", stageNeeded: "puppy", required: true },
  { category: "grooming", label: "Puppy shampoo", description: "Gentle, tear-free formula for puppy coats.", stageNeeded: "puppy", required: false },
  { category: "grooming", label: "Nail clippers", description: "Start trimming early so puppy gets used to it.", stageNeeded: "puppy", required: true },
  { category: "grooming", label: "Ear cleaner", description: "Especially for floppy-eared breeds prone to infections.", stageNeeded: "puppy", required: false },
  { category: "grooming", label: "Brush (coat-appropriate)", description: "Daily brushing for curly/long coats, weekly for smooth.", stageNeeded: "puppy", required: false },

  { category: "health-safety", label: "Pet insurance", description: "Sign up early — pre-existing conditions aren't covered.", stageNeeded: "puppy", required: true },
  { category: "health-safety", label: "Thermometer (digital)", description: "Normal dog temp: 101-102.5°F. Know what's normal for your dog.", stageNeeded: "puppy", required: false },
  { category: "health-safety", label: "First aid kit", description: "Bandages, antiseptic, tweezers, hydrogen peroxide.", stageNeeded: "all", required: false },
  { category: "health-safety", label: "Microchip registration", description: "Register the microchip with your contact info.", stageNeeded: "puppy", required: true },

  { category: "comfort", label: "Chew toys (Kong puppy)", description: "Puppy teething needs safe chew outlets.", stageNeeded: "puppy", required: true },
  { category: "comfort", label: "Plush toys", description: "Comfort and play. Remove if puppy shreds them.", stageNeeded: "puppy", required: false },
  { category: "comfort", label: "Rope toy", description: "Tug play and dental cleaning.", stageNeeded: "puppy", required: false },

  { category: "travel", label: "Car harness or travel crate", description: "Never let puppy ride loose in car.", stageNeeded: "puppy", required: true },
  { category: "travel", label: "3-in-1 carrier", description: "Car/stroller/portable kennel — useful for vet trips.", stageNeeded: "puppy", required: false },
];

const ADULT_ADOPTION_SUPPLIES: SupplyTemplate[] = [
  { category: "essentials", label: "Crate (adult size)", description: "Even adult dogs need a safe space. Size based on current weight.", stageNeeded: "adult", required: true },
  { category: "essentials", label: "Collar + 6ft leash", description: "ID tag on collar at all times.", stageNeeded: "adult", required: true },
  { category: "essentials", label: "ID tag", description: "Name + phone number.", stageNeeded: "adult", required: true },
  { category: "essentials", label: "Stainless steel bowls", description: "Two: water and food.", stageNeeded: "adult", required: true },
  { category: "essentials", label: "Dog bed", description: "Orthopedic for older dogs, washable cover.", stageNeeded: "adult", required: true },
  { category: "essentials", label: "Baby gates", description: "Gradual home introduction — don't give full house access on day one.", stageNeeded: "adult", required: false },

  { category: "feeding", label: "Adult dog food", description: "Transition gradually from shelter/foster food over 7 days.", stageNeeded: "adult", required: true },
  { category: "feeding", label: "Training treats", description: "For bonding exercises and training.", stageNeeded: "adult", required: true },
  { category: "feeding", label: "Treat pouch", description: "Keeps treats accessible.", stageNeeded: "adult", required: false },

  { category: "training", label: "Long line (15-30ft)", description: "For recall training and safe outdoor exploration.", stageNeeded: "adult", required: false },
  { category: "training", label: "Front-clip harness", description: "For dogs that pull. Better control than collar-only.", stageNeeded: "adult", required: false },

  { category: "grooming", label: "Enzymatic cleaner", description: "For accidents during decompression period.", stageNeeded: "adult", required: true },
  { category: "grooming", label: "Dog shampoo", description: "Coat-appropriate formula.", stageNeeded: "adult", required: false },
  { category: "grooming", label: "Nail clippers", description: "Regular nail maintenance.", stageNeeded: "adult", required: true },
  { category: "grooming", label: "Brush (coat-appropriate)", description: "Regular grooming builds bond and keeps coat healthy.", stageNeeded: "adult", required: false },

  { category: "health-safety", label: "Pet insurance", description: "Sign up early — pre-existing conditions may not be covered.", stageNeeded: "adult", required: true },
  { category: "health-safety", label: "First aid kit", description: "Bandages, antiseptic, tweezers.", stageNeeded: "all", required: false },
  { category: "health-safety", label: "Muzzle", description: "For vet safety if bite history is unknown.", stageNeeded: "adult", required: false },
  { category: "health-safety", label: "GPS tracker collar (Fi/AirTag)", description: "Flight-risk dogs especially. Peace of mind for newly adopted.", stageNeeded: "adult", required: false },

  { category: "comfort", label: "Chew toys (tough)", description: "Adult dogs need chew outlets. Nylabone, Kong extreme.", stageNeeded: "adult", required: true },
  { category: "comfort", label: "Decompression aids", description: "Calming treats (Zylkene, Composure), DAP diffuser (Adaptil), white noise.", stageNeeded: "adult", required: false },
  { category: "comfort", label: "Plush toys", description: "Comfort — remove if dog shreds them.", stageNeeded: "adult", required: false },

  { category: "travel", label: "Car harness or travel crate", description: "Safe transport for vet visits and outings.", stageNeeded: "adult", required: true },
];

const CATEGORY_INFO: { id: SupplyCategory; label: string; emoji: string }[] = [
  { id: "essentials", label: "Essentials", emoji: "⭐" },
  { id: "feeding", label: "Feeding", emoji: "🍽️" },
  { id: "training", label: "Training", emoji: "🦴" },
  { id: "grooming", label: "Grooming", emoji: "✂️" },
  { id: "health-safety", label: "Health & Safety", emoji: "🩺" },
  { id: "comfort", label: "Comfort", emoji: "🧸" },
  { id: "travel", label: "Travel", emoji: "🚗" },
];

export default function SupplyChecklist({ profile }: SupplyChecklistProps) {
  const [items, setItems] = useState<SupplyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "needed" | "purchased">("all");

  useEffect(() => {
    (async () => {
      let existing = await getAllSupplies();
      if (existing.length === 0) {
        const templates = profile.isAdoption ? ADULT_ADOPTION_SUPPLIES : PUPPY_SUPPLIES;
        const seeded = templates.map((tmpl) => ({
          id: generateId(),
          category: tmpl.category,
          label: tmpl.label,
          description: tmpl.description,
          stageNeeded: tmpl.stageNeeded,
          required: tmpl.required,
          purchased: false,
          custom: false,
        }));
        for (const item of seeded) {
          await saveSupply(item);
        }
        existing = seeded;
      }
      setItems(existing);
      setLoading(false);
    })();
  }, [profile.isAdoption]);

  async function togglePurchased(item: SupplyItem) {
    const updated: SupplyItem = {
      ...item,
      purchased: !item.purchased,
      purchasedDate: !item.purchased ? new Date().toISOString() : undefined,
    };
    await saveSupply(updated);
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-slate-500">Loading supply checklist...</p>
      </div>
    );
  }

  const totalPurchased = items.filter((i) => i.purchased).length;
  const totalRequired = items.filter((i) => i.required).length;
  const requiredPurchased = items.filter((i) => i.required && i.purchased).length;
  const overallPct = Math.round((totalPurchased / items.length) * 100);

  // Filter items
  let filtered = items;
  if (filter === "needed") filtered = items.filter((i) => !i.purchased);
  else if (filter === "purchased") filtered = items.filter((i) => i.purchased);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-700">Supply Checklist</h3>
          <span className="text-xs font-semibold text-amber-600">
            {totalPurchased}/{items.length} ({overallPct}%)
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-2">
          <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
        </div>
        <p className="text-xs text-slate-500">
          Required items: {requiredPurchased}/{totalRequired} purchased
        </p>

        {/* Filter buttons */}
        <div className="mt-3 flex gap-2">
          {(["all", "needed", "purchased"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={[
                "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                filter === f ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Category sections */}
      {CATEGORY_INFO.map((cat) => {
        const catItems = filtered.filter((i) => i.category === cat.id);
        if (catItems.length === 0) return null;

        return (
          <div key={cat.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="mb-3 text-sm font-bold text-slate-800">
              {cat.emoji} {cat.label}
            </h4>
            <div className="space-y-2">
              {catItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => togglePurchased(item)}
                  aria-pressed={item.purchased}
                  aria-label={`${item.label}${item.required ? " — required" : ""}${item.purchased ? " — purchased" : " — not yet purchased"}`}
                  className={[
                    "flex w-full items-start gap-3 rounded-lg border-2 px-3 py-2.5 text-left transition-all",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                    item.purchased
                      ? "border-amber-300 bg-amber-50"
                      : item.required
                        ? "border-rose-200 bg-white"
                        : "border-slate-100 bg-white hover:border-amber-200",
                  ].join(" ")}
                >
                  <div className={[
                    "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all flex-shrink-0",
                    item.purchased ? "border-amber-500 bg-amber-500" : "border-slate-300",
                  ].join(" ")}>
                    {item.purchased && <span className="text-xs text-white" aria-hidden="true">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={["text-sm font-semibold", item.purchased ? "text-slate-400 line-through" : "text-slate-800"].join(" ")}>
                        {item.label}
                      </span>
                      {item.required && !item.purchased && (
                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">REQUIRED</span>
                      )}
                      {item.stageNeeded !== "all" && item.stageNeeded !== profile.lifeStage && (
                        <span className="text-[10px] text-slate-400">({item.stageNeeded})</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
