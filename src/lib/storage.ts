// storage.ts — Pawgress IndexedDB storage layer
// Local-first, no server calls. All data stays in the browser.

const DB_NAME = "pawgress";
const DB_VERSION = 3; // Bumped for skill progress store

// ─── Types ────────────────────────────────────────────────────────────────────

export type CoatType = "curly" | "smooth" | "double" | "wire" | "long-silky" | "hairless";
export type Gender = "male" | "female";
export type LifeStage = "puppy" | "adolescent" | "adult" | "senior";
export type FeedingType = "kibble" | "mixed" | "homemade" | "raw";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type SocializationCategory = "people" | "environments" | "sounds" | "animals" | "surfaces";
export type SupplyCategory = "essentials" | "feeding" | "training" | "grooming" | "health-safety" | "comfort" | "travel";
export type StageNeeded = "puppy" | "adolescent" | "adult" | "all";
export type MilestoneCategory = "growth" | "vet" | "training" | "socialization" | "grooming" | "first";

export interface PuppyProfile {
  id: string;
  createdDate: string;
  puppyName: string;
  breedName: string;
  coatType: CoatType;
  expectedAdultWeightLbs: number;
  gender: Gender;
  birthDate: string;
  startDate: string;
  currentAgeWeeks: number;
  lifeStage: LifeStage;
  isAdoption: boolean;
  startWeightLbs?: number;
  trainingGoals: string[];
  feedingType: FeedingType;
  feedingBrand?: string;
  temperamentNotes?: string;
  avatarType: string;
}

export interface TrainingSession {
  id: string;
  date: string;
  skillId: string;
  skillName: string;
  durationMin: number;
  location: string;
  response: string;
  followUpResponse?: string;
  puppyPerformance: number;
  trainerPerformance: number;
  distractions: string[];
  breakthrough?: boolean;
}

export interface Milestone {
  id: string;
  category: MilestoneCategory;
  title: string;
  targetDate?: string;
  completedDate?: string;
  notes?: string;
  autoCalculated: boolean;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightLbs: number;
  notes?: string;
}

export interface SocializationItem {
  id: string;
  category: SocializationCategory;
  label: string;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

export interface SupplyItem {
  id: string;
  category: SupplyCategory;
  label: string;
  description: string;
  stageNeeded: StageNeeded;
  required: boolean;
  purchased: boolean;
  purchasedDate?: string;
  custom: boolean;
}

export interface FeedingEntry {
  id: string;
  date: string;
  mealType: MealType;
  foodName: string;
  amountCups: number;
  notes?: string;
}

export interface FeedingSchedule {
  id: string;
  puppyId: string;
  mealsPerDay: number;
  cupsPerMeal: number;
  totalCupsPerDay: number;
  currentFood: string;
  transitionFood?: string;
  transitionProgress?: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Skill Progress Types ─────────────────────────────────────────────────────

export interface SkillProgress {
  id: string;              // `${puppyId}-${skillId}`
  skillId: string;
  currentLevel: number;    // 1-5
  sessionsAtCurrentLevel: number;  // successful sessions at current level
  totalSessions: number;
  lastPracticed: string;   // ISO date
  breakthroughs: number;
  mastered: boolean;       // true when L5 reached
}

// ─── Guardian (Kid Side) Types ───────────────────────────────────────────────

export type MascotType = "ayla" | "flame" | "star" | "heart" | "rocket" | "paw";
export type GuardianBadgeType = "streak-3" | "streak-7" | "streak-14" | "first-log" | "graduation";

export interface KidProfile {
  id: string;
  childName: string;
  pin?: string;           // 4-digit PIN, optional
  mascot: MascotType;
  targetDate: string;     // ISO date — when pet arrives (calendar picker)
  createdAt: string;
}

export interface GuardianLog {
  id: string;
  date: string;           // ISO date (day, not time)
  checklistComplete: boolean;
  items: {
    floor: boolean;       // toys off floor
    cords: boolean;       // cords secured
    smallObjects: boolean; // small objects picked up
    foodSweep: boolean;   // food off surfaces/floor
  };
  streakAtLog: number;    // streak count at time of logging
}

export interface GuardianBadge {
  id: string;
  type: GuardianBadgeType;
  earnedDate: string;
}

export interface GuardianPrefs {
  id: string;
  hasSeenIntro: boolean;
  promiseSigned: boolean;
  promiseText?: string;
  graduationComplete: boolean;
}

// Prefs are simple key-value pairs
export type PrefKey = string;
export type PrefValue = string | number | boolean | object | null;

// ─── Store names ──────────────────────────────────────────────────────────────

const STORE_ONBOARDING = "onboarding";
const STORE_SESSIONS = "sessions";
const STORE_MILESTONES = "milestones";
const STORE_WEIGHTS = "weights";
const STORE_SUPPLIES = "supplies";
const STORE_PREFS = "prefs";
const STORE_SOCIALIZATION = "socialization";
const STORE_FEEDING = "feeding";
const STORE_FEEDING_SCHEDULES = "feeding_schedules";
const STORE_KID_PROFILE = "kidProfile";
const STORE_GUARDIAN_LOGS = "guardianLogs";
const STORE_GUARDIAN_BADGES = "guardianBadges";
const STORE_GUARDIAN_PREFS = "guardianPrefs";
const STORE_SKILL_PROGRESS = "skillProgress";

// ─── DB open ──────────────────────────────────────────────────────────────────

let dbPromise: Promise<IDBDatabase> | null = null;

export function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_ONBOARDING)) {
        db.createObjectStore(STORE_ONBOARDING, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_SESSIONS)) {
        const store = db.createObjectStore(STORE_SESSIONS, { keyPath: "id" });
        store.createIndex("byDate", "date", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_MILESTONES)) {
        const store = db.createObjectStore(STORE_MILESTONES, { keyPath: "id" });
        store.createIndex("byCategory", "category", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_WEIGHTS)) {
        const store = db.createObjectStore(STORE_WEIGHTS, { keyPath: "id" });
        store.createIndex("byDate", "date", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SUPPLIES)) {
        const store = db.createObjectStore(STORE_SUPPLIES, { keyPath: "id" });
        store.createIndex("byCategory", "category", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_PREFS)) {
        db.createObjectStore(STORE_PREFS, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORE_SOCIALIZATION)) {
        const store = db.createObjectStore(STORE_SOCIALIZATION, { keyPath: "id" });
        store.createIndex("byCategory", "category", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_FEEDING)) {
        const store = db.createObjectStore(STORE_FEEDING, { keyPath: "id" });
        store.createIndex("byDate", "date", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_FEEDING_SCHEDULES)) {
        db.createObjectStore(STORE_FEEDING_SCHEDULES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_KID_PROFILE)) {
        db.createObjectStore(STORE_KID_PROFILE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_GUARDIAN_LOGS)) {
        const store = db.createObjectStore(STORE_GUARDIAN_LOGS, { keyPath: "id" });
        store.createIndex("byDate", "date", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_GUARDIAN_BADGES)) {
        db.createObjectStore(STORE_GUARDIAN_BADGES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_GUARDIAN_PREFS)) {
        db.createObjectStore(STORE_GUARDIAN_PREFS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_SKILL_PROGRESS)) {
        const store = db.createObjectStore(STORE_SKILL_PROGRESS, { keyPath: "id" });
        store.createIndex("bySkillId", "skillId", { unique: false });
      }
    };
  });

  return dbPromise;
}

// ─── Generic helpers ──────────────────────────────────────────────────────────

function txStore(db: IDBDatabase, storeName: string, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(storeName, mode).objectStore(storeName);
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveItem<T>(storeName: string, item: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getItem<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDB();
  return reqToPromise(txStore(db, storeName, "readonly").get(key) as IDBRequest<T | undefined>);
}

async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return reqToPromise(txStore(db, storeName, "readonly").getAll() as IDBRequest<T[]>);
}

async function deleteItem(storeName: string, key: IDBValidKey): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── PuppyProfile (onboarding store) ──────────────────────────────────────────

export async function saveProfile(profile: PuppyProfile): Promise<void> {
  await saveItem(STORE_ONBOARDING, profile);
}

export async function getProfile(id: string = "default"): Promise<PuppyProfile | undefined> {
  return getItem<PuppyProfile>(STORE_ONBOARDING, id);
}

export async function getAllProfiles(): Promise<PuppyProfile[]> {
  return getAllItems<PuppyProfile>(STORE_ONBOARDING);
}

export async function deleteProfile(id: string): Promise<void> {
  await deleteItem(STORE_ONBOARDING, id);
}

// ─── TrainingSession ──────────────────────────────────────────────────────────

export async function saveSession(session: TrainingSession): Promise<void> {
  await saveItem(STORE_SESSIONS, session);
}

export async function getSession(id: string): Promise<TrainingSession | undefined> {
  return getItem<TrainingSession>(STORE_SESSIONS, id);
}

export async function getAllSessions(): Promise<TrainingSession[]> {
  const all = await getAllItems<TrainingSession>(STORE_SESSIONS);
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export async function deleteSession(id: string): Promise<void> {
  await deleteItem(STORE_SESSIONS, id);
}

// ─── Milestone ────────────────────────────────────────────────────────────────

export async function saveMilestone(milestone: Milestone): Promise<void> {
  await saveItem(STORE_MILESTONES, milestone);
}

export async function getMilestone(id: string): Promise<Milestone | undefined> {
  return getItem<Milestone>(STORE_MILESTONES, id);
}

export async function getAllMilestones(): Promise<Milestone[]> {
  return getAllItems<Milestone>(STORE_MILESTONES);
}

export async function deleteMilestone(id: string): Promise<void> {
  await deleteItem(STORE_MILESTONES, id);
}

// ─── WeightEntry ──────────────────────────────────────────────────────────────

export async function saveWeight(entry: WeightEntry): Promise<void> {
  await saveItem(STORE_WEIGHTS, entry);
}

export async function getWeight(id: string): Promise<WeightEntry | undefined> {
  return getItem<WeightEntry>(STORE_WEIGHTS, id);
}

export async function getAllWeights(): Promise<WeightEntry[]> {
  const all = await getAllItems<WeightEntry>(STORE_WEIGHTS);
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

export async function deleteWeight(id: string): Promise<void> {
  await deleteItem(STORE_WEIGHTS, id);
}

// ─── SupplyItem ───────────────────────────────────────────────────────────────

export async function saveSupply(item: SupplyItem): Promise<void> {
  await saveItem(STORE_SUPPLIES, item);
}

export async function getSupply(id: string): Promise<SupplyItem | undefined> {
  return getItem<SupplyItem>(STORE_SUPPLIES, id);
}

export async function getAllSupplies(): Promise<SupplyItem[]> {
  return getAllItems<SupplyItem>(STORE_SUPPLIES);
}

export async function deleteSupply(id: string): Promise<void> {
  await deleteItem(STORE_SUPPLIES, id);
}

// ─── SocializationItem ────────────────────────────────────────────────────────

export async function saveSocializationItem(item: SocializationItem): Promise<void> {
  await saveItem(STORE_SOCIALIZATION, item);
}

export async function getSocializationItem(id: string): Promise<SocializationItem | undefined> {
  return getItem<SocializationItem>(STORE_SOCIALIZATION, id);
}

export async function getAllSocializationItems(): Promise<SocializationItem[]> {
  return getAllItems<SocializationItem>(STORE_SOCIALIZATION);
}

export async function deleteSocializationItem(id: string): Promise<void> {
  await deleteItem(STORE_SOCIALIZATION, id);
}

// ─── FeedingEntry ─────────────────────────────────────────────────────────────

export async function saveFeedingEntry(entry: FeedingEntry): Promise<void> {
  await saveItem(STORE_FEEDING, entry);
}

export async function getFeedingEntry(id: string): Promise<FeedingEntry | undefined> {
  return getItem<FeedingEntry>(STORE_FEEDING, id);
}

export async function getAllFeedingEntries(): Promise<FeedingEntry[]> {
  const all = await getAllItems<FeedingEntry>(STORE_FEEDING);
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

export async function deleteFeedingEntry(id: string): Promise<void> {
  await deleteItem(STORE_FEEDING, id);
}

// ─── FeedingSchedule ──────────────────────────────────────────────────────────

export async function saveFeedingSchedule(schedule: FeedingSchedule): Promise<void> {
  await saveItem(STORE_FEEDING_SCHEDULES, schedule);
}

export async function getFeedingSchedule(id: string): Promise<FeedingSchedule | undefined> {
  return getItem<FeedingSchedule>(STORE_FEEDING_SCHEDULES, id);
}

export async function getAllFeedingSchedules(): Promise<FeedingSchedule[]> {
  return getAllItems<FeedingSchedule>(STORE_FEEDING_SCHEDULES);
}

export async function deleteFeedingSchedule(id: string): Promise<void> {
  await deleteItem(STORE_FEEDING_SCHEDULES, id);
}

// ─── Prefs ────────────────────────────────────────────────────────────────────

export async function getPref<T extends PrefValue>(key: PrefKey): Promise<T | undefined> {
  const db = await openDB();
  const result = await reqToPromise(
    txStore(db, STORE_PREFS, "readonly").get(key) as IDBRequest<{ key: PrefKey; value: T } | undefined>
  );
  return result?.value;
}

export async function setPref(key: PrefKey, value: PrefValue): Promise<void> {
  await saveItem(STORE_PREFS, { key, value });
}

export async function deletePref(key: PrefKey): Promise<void> {
  await deleteItem(STORE_PREFS, key);
}

// ─── Bulk operations ──────────────────────────────────────────────────────────

export async function deleteAllData(): Promise<void> {
  const db = await openDB();
  const storeNames = [
    STORE_ONBOARDING,
    STORE_SESSIONS,
    STORE_MILESTONES,
    STORE_WEIGHTS,
    STORE_SUPPLIES,
    STORE_PREFS,
    STORE_SOCIALIZATION,
    STORE_FEEDING,
    STORE_FEEDING_SCHEDULES,
    STORE_KID_PROFILE,
    STORE_GUARDIAN_LOGS,
    STORE_GUARDIAN_BADGES,
    STORE_GUARDIAN_PREFS,
    STORE_SKILL_PROGRESS,
  ];
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, "readwrite");
    for (const name of storeNames) {
      tx.objectStore(name).clear();
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export interface ExportData {
  profiles: PuppyProfile[];
  sessions: TrainingSession[];
  milestones: Milestone[];
  weights: WeightEntry[];
  supplies: SupplyItem[];
  socialization: SocializationItem[];
  feeding: FeedingEntry[];
  feedingSchedules: FeedingSchedule[];
  prefs: { key: PrefKey; value: PrefValue }[];
  kidProfiles: KidProfile[];
  guardianLogs: GuardianLog[];
  guardianBadges: GuardianBadge[];
  guardianPrefs: GuardianPrefs[];
  skillProgress: SkillProgress[];
  exportedAt: string;
  appVersion: string;
}

export async function exportAllData(): Promise<ExportData> {
  const [profiles, sessions, milestones, weights, supplies, socialization, feeding, feedingSchedules, prefs, kidProfiles, guardianLogs, guardianBadges, guardianPrefs, skillProgress] =
    await Promise.all([
      getAllProfiles(),
      getAllSessions(),
      getAllMilestones(),
      getAllWeights(),
      getAllSupplies(),
      getAllSocializationItems(),
      getAllFeedingEntries(),
      getAllFeedingSchedules(),
      getAllItems<{ key: PrefKey; value: PrefValue }>(STORE_PREFS),
      getAllKidProfiles(),
      getAllGuardianLogs(),
      getAllGuardianBadges(),
      getAllGuardianPrefs(),
      getAllItems<SkillProgress>(STORE_SKILL_PROGRESS),
    ]);

  return {
    profiles,
    sessions,
    milestones,
    weights,
    supplies,
    socialization,
    feeding,
    feedingSchedules,
    prefs,
    kidProfiles,
    guardianLogs,
    guardianBadges,
    guardianPrefs,
    skillProgress,
    exportedAt: new Date().toISOString(),
    appVersion: "0.1.0",
  };
}

export async function importData(data: ExportData): Promise<void> {
  const db = await openDB();
  const storeNames = [
    STORE_ONBOARDING,
    STORE_SESSIONS,
    STORE_MILESTONES,
    STORE_WEIGHTS,
    STORE_SUPPLIES,
    STORE_PREFS,
    STORE_SOCIALIZATION,
    STORE_FEEDING,
    STORE_FEEDING_SCHEDULES,
    STORE_KID_PROFILE,
    STORE_GUARDIAN_LOGS,
    STORE_GUARDIAN_BADGES,
    STORE_GUARDIAN_PREFS,
    STORE_SKILL_PROGRESS,
  ];

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeNames, "readwrite");

    // Clear all stores first
    for (const name of storeNames) {
      tx.objectStore(name).clear();
    }

    // Then populate
    for (const profile of data.profiles || []) {
      tx.objectStore(STORE_ONBOARDING).put(profile);
    }
    for (const session of data.sessions || []) {
      tx.objectStore(STORE_SESSIONS).put(session);
    }
    for (const milestone of data.milestones || []) {
      tx.objectStore(STORE_MILESTONES).put(milestone);
    }
    for (const weight of data.weights || []) {
      tx.objectStore(STORE_WEIGHTS).put(weight);
    }
    for (const supply of data.supplies || []) {
      tx.objectStore(STORE_SUPPLIES).put(supply);
    }
    for (const item of data.socialization || []) {
      tx.objectStore(STORE_SOCIALIZATION).put(item);
    }
    for (const entry of data.feeding || []) {
      tx.objectStore(STORE_FEEDING).put(entry);
    }
    for (const schedule of data.feedingSchedules || []) {
      tx.objectStore(STORE_FEEDING_SCHEDULES).put(schedule);
    }
    for (const pref of data.prefs || []) {
      tx.objectStore(STORE_PREFS).put(pref);
    }
    for (const kidProfile of data.kidProfiles || []) {
      tx.objectStore(STORE_KID_PROFILE).put(kidProfile);
    }
    for (const log of data.guardianLogs || []) {
      tx.objectStore(STORE_GUARDIAN_LOGS).put(log);
    }
    for (const badge of data.guardianBadges || []) {
      tx.objectStore(STORE_GUARDIAN_BADGES).put(badge);
    }
    for (const gpref of data.guardianPrefs || []) {
      tx.objectStore(STORE_GUARDIAN_PREFS).put(gpref);
    }
    for (const sp of data.skillProgress || []) {
      tx.objectStore(STORE_SKILL_PROGRESS).put(sp);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function calculateAgeWeeks(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
}

export function calculateLifeStage(ageWeeks: number, breedName: string): LifeStage {
  // Small breeds mature faster, large breeds slower
  const lowerBreed = breedName.toLowerCase();
  const isLargeBreed =
    lowerBreed.includes("labrador") ||
    lowerBreed.includes("golden") ||
    lowerBreed.includes("german") ||
    lowerBreed.includes("rottweiler") ||
    lowerBreed.includes("great dane") ||
    lowerBreed.includes("mastiff") ||
    lowerBreed.includes("saint bernard") ||
    lowerBreed.includes("newfoundland") ||
    lowerBreed.includes("bernese");

  if (isLargeBreed) {
    if (ageWeeks < 18) return "puppy";
    if (ageWeeks < 72) return "adolescent";
    if (ageWeeks < 312) return "adult";
    return "senior";
  }

  if (ageWeeks < 16) return "puppy";
  if (ageWeeks < 52) return "adolescent";
  if (ageWeeks < 312) return "adult";
  return "senior";
}

// ─── SkillProgress ────────────────────────────────────────────────────────────

export async function getSkillProgress(skillId: string, puppyId: string = "default"): Promise<SkillProgress | undefined> {
  return getItem<SkillProgress>(STORE_SKILL_PROGRESS, `${puppyId}-${skillId}`);
}

export async function getAllSkillProgress(puppyId: string = "default"): Promise<SkillProgress[]> {
  const all = await getAllItems<SkillProgress>(STORE_SKILL_PROGRESS);
  return all.filter((p) => p.id.startsWith(`${puppyId}-`));
}

export async function saveSkillProgress(progress: SkillProgress): Promise<void> {
  await saveItem(STORE_SKILL_PROGRESS, progress);
}

export async function deleteSkillProgress(id: string): Promise<void> {
  await deleteItem(STORE_SKILL_PROGRESS, id);
}

/**
 * Update skill progress after a training session.
 * Auto-calculates level progression: 3 successful sessions at current level = level up.
 * Puppy performance 4-5 = successful session.
 */
export async function updateSkillProgressAfterSession(
  skillId: string,
  puppyPerformance: number,
  breakthrough: boolean,
  puppyId: string = "default",
): Promise<SkillProgress> {
 const id = `${puppyId}-${skillId}`;
  const existing = await getSkillProgress(skillId, puppyId);

  const now = new Date().toISOString();
  const isSuccessful = puppyPerformance >= 4;

  let progress: SkillProgress;
  if (existing) {
    progress = { ...existing };
    progress.totalSessions++;
    progress.lastPracticed = now;
    if (breakthrough) progress.breakthroughs++;
    if (isSuccessful && !progress.mastered) {
      progress.sessionsAtCurrentLevel++;
      // 3 successful sessions = ready to level up
      if (progress.sessionsAtCurrentLevel >= 3 && progress.currentLevel < 5) {
        progress.currentLevel++;
        progress.sessionsAtCurrentLevel = 0;
        if (progress.currentLevel >= 5) progress.mastered = true;
      }
    }
  } else {
    progress = {
      id,
      skillId,
      currentLevel: 1,
      sessionsAtCurrentLevel: isSuccessful ? 1 : 0,
      totalSessions: 1,
      lastPracticed: now,
      breakthroughs: breakthrough ? 1 : 0,
      mastered: false,
    };
  }

  await saveSkillProgress(progress);
  return progress;
}

// ─── KidProfile (Guardian) ────────────────────────────────────────────────────

export async function saveKidProfile(profile: KidProfile): Promise<void> {
  await saveItem(STORE_KID_PROFILE, profile);
}

export async function getKidProfile(id: string = "default"): Promise<KidProfile | undefined> {
  return getItem<KidProfile>(STORE_KID_PROFILE, id);
}

export async function getAllKidProfiles(): Promise<KidProfile[]> {
  return getAllItems<KidProfile>(STORE_KID_PROFILE);
}

export async function deleteKidProfile(id: string): Promise<void> {
  await deleteItem(STORE_KID_PROFILE, id);
}

// ─── GuardianLog ──────────────────────────────────────────────────────────────

export async function saveGuardianLog(log: GuardianLog): Promise<void> {
  await saveItem(STORE_GUARDIAN_LOGS, log);
}

export async function getGuardianLog(id: string): Promise<GuardianLog | undefined> {
  return getItem<GuardianLog>(STORE_GUARDIAN_LOGS, id);
}

export async function getAllGuardianLogs(): Promise<GuardianLog[]> {
  const all = await getAllItems<GuardianLog>(STORE_GUARDIAN_LOGS);
  return all.sort((a, b) => a.date.localeCompare(b.date));
}

export async function deleteGuardianLog(id: string): Promise<void> {
  await deleteItem(STORE_GUARDIAN_LOGS, id);
}

// ─── GuardianBadge ────────────────────────────────────────────────────────────

export async function saveGuardianBadge(badge: GuardianBadge): Promise<void> {
  await saveItem(STORE_GUARDIAN_BADGES, badge);
}

export async function getGuardianBadge(id: string): Promise<GuardianBadge | undefined> {
  return getItem<GuardianBadge>(STORE_GUARDIAN_BADGES, id);
}

export async function getAllGuardianBadges(): Promise<GuardianBadge[]> {
  return getAllItems<GuardianBadge>(STORE_GUARDIAN_BADGES);
}

export async function deleteGuardianBadge(id: string): Promise<void> {
  await deleteItem(STORE_GUARDIAN_BADGES, id);
}

// ─── GuardianPrefs ─────────────────────────────────────────────────────────────

export async function saveGuardianPrefs(prefs: GuardianPrefs): Promise<void> {
  await saveItem(STORE_GUARDIAN_PREFS, prefs);
}

export async function getGuardianPrefs(id: string = "default"): Promise<GuardianPrefs | undefined> {
  return getItem<GuardianPrefs>(STORE_GUARDIAN_PREFS, id);
}

export async function getAllGuardianPrefs(): Promise<GuardianPrefs[]> {
  return getAllItems<GuardianPrefs>(STORE_GUARDIAN_PREFS);
}

export async function deleteGuardianPrefs(id: string): Promise<void> {
  await deleteItem(STORE_GUARDIAN_PREFS, id);
}

// ─── Guardian Streak & Badge Logic ─────────────────────────────────────────────

/**
 * Calculate the current streak based on guardian logs.
 * - If last log is today: streak is already counted (return streakAtLog from last log)
 * - If last log is yesterday: streak continues (return last log's streakAtLog)
 * - If gap > 1 day: streak resets to 0
 * - If no logs: streak is 0
 */
export function calculateStreak(logs: GuardianLog[]): number {
  if (logs.length === 0) return 0;

  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const lastLog = sorted[0];

  const today = todayISODate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (lastLog.date === today) {
    // Already logged today — return the streak at log time
    return lastLog.streakAtLog;
  }

  if (lastLog.date === yesterdayStr) {
    // Last log was yesterday — streak is still alive but not yet incremented today
    return lastLog.streakAtLog;
  }

  // Gap > 1 day — streak reset
  return 0;
}

/**
 * Check which new badges should be awarded based on the current streak and log history.
 * Returns badges that should be newly awarded (not already earned).
 */
export function checkAndAwardBadges(
  streak: number,
  existingBadges: GuardianBadge[],
  logCount: number
): GuardianBadge[] {
  const earnedTypes = new Set(existingBadges.map((b) => b.type));
  const newBadges: GuardianBadge[] = [];
  const now = new Date().toISOString();

  if (!earnedTypes.has("first-log") && logCount >= 1) {
    newBadges.push({ id: generateId(), type: "first-log", earnedDate: now });
  }
  if (!earnedTypes.has("streak-3") && streak >= 3) {
    newBadges.push({ id: generateId(), type: "streak-3", earnedDate: now });
  }
  if (!earnedTypes.has("streak-7") && streak >= 7) {
    newBadges.push({ id: generateId(), type: "streak-7", earnedDate: now });
  }
  if (!earnedTypes.has("streak-14") && streak >= 14) {
    newBadges.push({ id: generateId(), type: "streak-14", earnedDate: now });
  }
  if (!earnedTypes.has("graduation") && streak >= 14) {
    newBadges.push({ id: generateId(), type: "graduation", earnedDate: now });
  }

  return newBadges;
}

/**
 * Get the longest streak achieved from the log history.
 */
export function getLongestStreak(logs: GuardianLog[]): number {
  if (logs.length === 0) return 0;
  return Math.max(...logs.map((l) => l.streakAtLog));
}

/**
 * Returns today's date as an ISO date string (YYYY-MM-DD).
 */
export function todayISODate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Calculate days until the target (pet arrival) date.
 * Returns 0 if the date has passed.
 */
export function daysUntilTarget(targetDate: string): number {
  const target = new Date(targetDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}
