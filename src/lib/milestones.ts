// milestones.ts — Pre-seeded milestone timeline for Pawgress
// Based on birth date + life stage at onboarding

import type { Milestone, PuppyProfile, MilestoneCategory } from "./storage";
import { generateId } from "./storage";

// ─── Puppy Milestones (8-16 weeks at onboarding) ──────────────────────────────

interface MilestoneTemplate {
  category: MilestoneCategory;
  title: string;
  ageWeeks?: number;          // target age in weeks (auto-calculated from birthDate)
  offsetDays?: number;        // or fixed offset from startDate
  notes?: string;
  autoCalculated: boolean;
}

const PUPPY_MILESTONES: MilestoneTemplate[] = [
  // Firsts
  { category: "first", title: "First night home", offsetDays: 0, autoCalculated: true, notes: "The big welcome day" },
  { category: "first", title: "First walk outside", offsetDays: 3, autoCalculated: true, notes: "After vaccinations — short and gentle" },
  { category: "first", title: "First vet visit", offsetDays: 3, autoCalculated: true, notes: "Wellness check within 72 hours" },
  { category: "first", title: "First grooming", ageWeeks: 12, autoCalculated: true },
  { category: "first", title: "First trick learned", ageWeeks: 14, autoCalculated: true, notes: "Shake, sit, or spin — celebrate it!" },
  { category: "first", title: "First public outing", ageWeeks: 16, autoCalculated: true },

  // Growth
  { category: "growth", title: "Teething begins", ageWeeks: 12, autoCalculated: true, notes: "Provide chew toys — save your furniture" },
  { category: "growth", title: "Adult teeth coming in", ageWeeks: 16, autoCalculated: true },
  { category: "growth", title: "Half adult weight", ageWeeks: 20, autoCalculated: true },
  { category: "growth", title: "Full height (approx)", ageWeeks: 52, autoCalculated: true, notes: "Large breeds take longer" },
  { category: "growth", title: "Full adult weight", ageWeeks: 72, autoCalculated: true, notes: "14-18 months for medium breeds" },
  { category: "growth", title: "Mental maturity", ageWeeks: 104, autoCalculated: true, notes: "18-24 months — adolescent brain settles" },

  // Vet
  { category: "vet", title: "8-week vaccines (DA2PP round 1)", ageWeeks: 8, autoCalculated: true },
  { category: "vet", title: "12-week vaccines (DA2PP round 2)", ageWeeks: 12, autoCalculated: true },
  { category: "vet", title: "16-week vaccines (DA2PP round 3 + Rabies)", ageWeeks: 16, autoCalculated: true },
  { category: "vet", title: "6-month checkup", ageWeeks: 26, autoCalculated: true },
  { category: "vet", title: "Spay/neuter consultation", ageWeeks: 24, autoCalculated: true, notes: "Discuss timing with vet — large breeds benefit from waiting" },
  { category: "vet", title: "12-month annual exam", ageWeeks: 52, autoCalculated: true },

  // Training
  { category: "training", title: "Name recognition solid", ageWeeks: 10, autoCalculated: true },
  { category: "training", title: "Sit on cue", ageWeeks: 10, autoCalculated: true },
  { category: "training", title: "Reliable recall (L3)", ageWeeks: 14, autoCalculated: true },
  { category: "training", title: "Loose leash basics", ageWeeks: 14, autoCalculated: true },
  { category: "training", title: "Stay (30 sec, distance)", ageWeeks: 16, autoCalculated: true },
  { category: "training", title: "CGC ready", ageWeeks: 52, autoCalculated: true, notes: "Canine Good Citizen test — therapy dog prerequisite" },

  // Socialization
  { category: "socialization", title: "10+ people exposures", ageWeeks: 12, autoCalculated: true, notes: "Critical window 8-16 weeks" },
  { category: "socialization", title: "5+ environments visited", ageWeeks: 14, autoCalculated: true },
  { category: "socialization", title: "10+ sounds desensitized", ageWeeks: 14, autoCalculated: true },
  { category: "socialization", title: "Vet handling comfortable", ageWeeks: 16, autoCalculated: true },

  // Grooming
  { category: "grooming", title: "Brush routine established", ageWeeks: 10, autoCalculated: true },
  { category: "grooming", title: "Nail trim comfortable", ageWeeks: 12, autoCalculated: true },
  { category: "grooming", title: "First professional groom", ageWeeks: 16, autoCalculated: true },
  { category: "grooming", title: "Regular grooming schedule", ageWeeks: 24, autoCalculated: true, notes: "Every 6-8 weeks for curly coats" },
];

// ─── Adult Adoption Milestones (3-3-3 rule) ───────────────────────────────────

const ADULT_ADOPTION_MILESTONES: MilestoneTemplate[] = [
  // Firsts
  { category: "first", title: "First night home", offsetDays: 0, autoCalculated: true, notes: "Give space — decompression starts" },
  { category: "first", title: "First walk", offsetDays: 3, autoCalculated: true, notes: "Short, low-stress route" },
  { category: "first", title: "First vet visit", offsetDays: 3, autoCalculated: true, notes: "Wellness check within 72 hours" },
  { category: "first", title: "First trick learned", offsetDays: 14, autoCalculated: true },
  { category: "first", title: "First public outing", offsetDays: 21, autoCalculated: true },

  // Decompression (3-3-3 rule)
  { category: "growth", title: "3 days — settling in", offsetDays: 3, autoCalculated: true, notes: "Overwhelmed, may not eat, may shut down. This is normal." },
  { category: "growth", title: "3 weeks — learning routine", offsetDays: 21, autoCalculated: true, notes: "Starting to understand household rhythm, personality emerging" },
  { category: "growth", title: "3 months — fully comfortable", offsetDays: 90, autoCalculated: true, notes: "True personality, bonded, feels at home" },

  // Vet
  { category: "vet", title: "Initial wellness check", offsetDays: 3, autoCalculated: true, notes: "Within 72 hours of adoption" },
  { category: "vet", title: "Vaccine catch-up (if needed)", offsetDays: 14, autoCalculated: true, notes: "Confirm prior vaccination history" },
  { category: "vet", title: "Dental evaluation", offsetDays: 30, autoCalculated: true },
  { category: "vet", title: "Annual exam", offsetDays: 365, autoCalculated: true },

  // Training
  { category: "training", title: "Bond established", offsetDays: 14, autoCalculated: true, notes: "Dog checks in with you, seeks you out" },
  { category: "training", title: "First reliable command", offsetDays: 21, autoCalculated: true, notes: "Sit, name recognition, or recall — first proof of trust" },
  { category: "training", title: "House training solid", offsetDays: 30, autoCalculated: true },
  { category: "training", title: "CGC ready", offsetDays: 90, autoCalculated: true, notes: "Canine Good Citizen — if pursuing therapy work" },

  // Socialization
  { category: "socialization", title: "Comfortable in home", offsetDays: 14, autoCalculated: true },
  { category: "socialization", title: "Comfortable on walks", offsetDays: 21, autoCalculated: true },
  { category: "socialization", title: "Comfortable with visitors", offsetDays: 30, autoCalculated: true },
  { category: "socialization", title: "Comfortable in new places", offsetDays: 60, autoCalculated: true },

  // Grooming
  { category: "grooming", title: "First grooming session", offsetDays: 14, autoCalculated: true },
  { category: "grooming", title: "Regular grooming schedule", offsetDays: 60, autoCalculated: true },
];

// ─── Generate milestones from profile ─────────────────────────────────────────

export function generateMilestones(profile: PuppyProfile): Milestone[] {
  const templates = profile.isAdoption ? ADULT_ADOPTION_MILESTONES : PUPPY_MILESTONES;
  const birthDate = new Date(profile.birthDate);
  const startDate = new Date(profile.startDate);

  return templates.map((tmpl) => {
    let targetDate: string | undefined;

    if (tmpl.ageWeeks !== undefined) {
      const target = new Date(birthDate);
      target.setDate(target.getDate() + tmpl.ageWeeks * 7);
      targetDate = target.toISOString().split("T")[0];
    } else if (tmpl.offsetDays !== undefined) {
      const target = new Date(startDate);
      target.setDate(target.getDate() + tmpl.offsetDays);
      targetDate = target.toISOString().split("T")[0];
    }

    return {
      id: generateId(),
      category: tmpl.category,
      title: tmpl.title,
      targetDate,
      notes: tmpl.notes,
      autoCalculated: tmpl.autoCalculated,
    };
  });
}

// ─── Growth stage calculation ─────────────────────────────────────────────────

export type GrowthStage = "new-pup" | "learning" | "growing" | "skilled" | "mastered";

export const GROWTH_STAGES: { stage: GrowthStage; minSessions: number; label: string; emoji: string }[] = [
  { stage: "new-pup", minSessions: 0, label: "New Pup", emoji: "🐣" },
  { stage: "learning", minSessions: 3, label: "Learning", emoji: "🐶" },
  { stage: "growing", minSessions: 10, label: "Growing", emoji: "🐕" },
  { stage: "skilled", minSessions: 30, label: "Skilled", emoji: "🦮" },
  { stage: "mastered", minSessions: 60, label: "Mastered", emoji: "🏆" },
];

export function getGrowthStage(totalSessions: number): typeof GROWTH_STAGES[0] {
  let current = GROWTH_STAGES[0];
  for (const stage of GROWTH_STAGES) {
    if (totalSessions >= stage.minSessions) {
      current = stage;
    }
  }
  return current;
}

export function getNextGrowthStage(totalSessions: number): typeof GROWTH_STAGES[0] | null {
  for (const stage of GROWTH_STAGES) {
    if (totalSessions < stage.minSessions) {
      return stage;
    }
  }
  return null; // maxed out
}
