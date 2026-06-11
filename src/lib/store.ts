// Local-only data layer for the medication tracker (prototype).
// Persists to localStorage. No backend, no medical advice — the user enters
// their own regimen (as prescribed) and the app reminds + records.

export type Unit = "pill" | "tablet" | "capsule" | "ml" | "mg" | "drop" | "puff" | "unit";

export interface Medication {
  id: string;
  name: string;
  strength: string;        // e.g. "500mg"
  unit: Unit;
  amount: number;          // doses per intake, e.g. 1 or 2
  times: string[];         // ["08:00","20:00"]
  daysOfWeek: number[];    // 0-6 (Sun-Sat); empty = every day
  color: string;
  notes?: string;
  withFood?: boolean;
  stockCount?: number;     // optional refill tracking
  createdAt: number;
}

export type DoseStatus = "taken" | "skipped";

export interface DoseLog {
  id: string;              // `${medId}|${date}|${time}`
  medId: string;
  date: string;            // YYYY-MM-DD
  time: string;            // HH:MM
  status: DoseStatus;
  at: number;              // timestamp of action
}

export interface ScheduledDose {
  key: string;
  medId: string;
  med: Medication;
  time: string;
  date: string;
  status: DoseStatus | "pending";
}

const MED_KEY = "meds.v1";
const LOG_KEY = "doselog.v1";

export const MED_COLORS = [
  "#0f9d8a", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#ef4444", "#10b981", "#6366f1",
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

export function loadMeds(): Medication[] {
  return read<Medication[]>(MED_KEY, []);
}
export function saveMeds(meds: Medication[]) {
  write(MED_KEY, meds);
}
export function loadLogs(): DoseLog[] {
  return read<DoseLog[]>(LOG_KEY, []);
}
export function saveLogs(logs: DoseLog[]) {
  write(LOG_KEY, logs);
}

export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

// Build the scheduled doses for a given date from meds + logs.
export function scheduleFor(
  date: string,
  meds: Medication[],
  logs: DoseLog[]
): ScheduledDose[] {
  const dow = new Date(date + "T00:00:00").getDay();
  const items: ScheduledDose[] = [];
  for (const med of meds) {
    const active = med.daysOfWeek.length === 0 || med.daysOfWeek.includes(dow);
    if (!active) continue;
    for (const time of med.times) {
      const key = `${med.id}|${date}|${time}`;
      const log = logs.find((l) => l.id === key);
      items.push({
        key,
        medId: med.id,
        med,
        time,
        date,
        status: log ? log.status : "pending",
      });
    }
  }
  return items.sort((a, b) => a.time.localeCompare(b.time));
}

export function adherence(
  meds: Medication[],
  logs: DoseLog[],
  days: number
): { taken: number; total: number; pct: number; perDay: { date: string; taken: number; total: number }[] } {
  const perDay: { date: string; taken: number; total: number }[] = [];
  let taken = 0;
  let total = 0;
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const ds = todayStr(d);
    const sched = scheduleFor(ds, meds, logs);
    // only count past/today doses, not future times today
    const dayTaken = sched.filter((s) => s.status === "taken").length;
    const dayTotal = sched.length;
    perDay.push({ date: ds, taken: dayTaken, total: dayTotal });
    taken += dayTaken;
    total += dayTotal;
  }
  return { taken, total, pct: total ? Math.round((taken / total) * 100) : 0, perDay };
}

export function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const am = h < 12;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${am ? "AM" : "PM"}`;
}
