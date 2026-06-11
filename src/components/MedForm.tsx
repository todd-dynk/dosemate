"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Medication, Unit, MED_COLORS, uid } from "@/lib/store";
import { useMeds } from "@/lib/useStore";

const UNITS: Unit[] = ["pill", "tablet", "capsule", "ml", "mg", "drop", "puff", "unit"];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MedForm({ existing }: { existing?: Medication }) {
  const router = useRouter();
  const { upsertMed, removeMed } = useMeds();

  const [name, setName] = useState(existing?.name ?? "");
  const [strength, setStrength] = useState(existing?.strength ?? "");
  const [unit, setUnit] = useState<Unit>(existing?.unit ?? "tablet");
  const [amount, setAmount] = useState(existing?.amount ?? 1);
  const [times, setTimes] = useState<string[]>(existing?.times ?? ["08:00"]);
  const [days, setDays] = useState<number[]>(existing?.daysOfWeek ?? []);
  const [withFood, setWithFood] = useState(existing?.withFood ?? false);
  const [stock, setStock] = useState<string>(
    existing?.stockCount != null ? String(existing.stockCount) : ""
  );
  const [color, setColor] = useState(existing?.color ?? MED_COLORS[0]);
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const field =
    "w-full rounded-xl border border-[var(--line)] bg-[var(--card)] px-3.5 py-3 outline-none focus:border-[var(--primary)]";

  function addTime() {
    setTimes((t) => [...t, "12:00"]);
  }
  function setTime(i: number, v: string) {
    setTimes((t) => t.map((x, idx) => (idx === i ? v : x)));
  }
  function removeTime(i: number) {
    setTimes((t) => (t.length > 1 ? t.filter((_, idx) => idx !== i) : t));
  }
  function toggleDay(i: number) {
    setDays((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort()));
  }

  function save() {
    if (!name.trim()) return;
    const med: Medication = {
      id: existing?.id ?? uid(),
      name: name.trim(),
      strength: strength.trim(),
      unit,
      amount: Math.max(1, amount),
      times: [...times].sort(),
      daysOfWeek: days,
      color,
      withFood,
      stockCount: stock.trim() === "" ? undefined : Math.max(0, parseInt(stock, 10) || 0),
      notes: notes.trim() || undefined,
      createdAt: existing?.createdAt ?? Date.now(),
    };
    upsertMed(med);
    router.push("/meds");
  }

  return (
    <div className="px-5 pt-6 pb-10 space-y-5 slide-up">
      <h1 className="text-2xl font-bold">{existing ? "Edit" : "Add"} Medication</h1>

      <Field label="Name">
        <input
          className={field}
          placeholder="e.g. Metformin"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Strength">
          <input
            className={field}
            placeholder="500mg"
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
          />
        </Field>
        <Field label="Form">
          <select className={field} value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Amount per dose">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAmount((a) => Math.max(1, a - 1))}
            className="h-11 w-11 rounded-xl border border-[var(--line)] text-xl"
          >
            −
          </button>
          <span className="text-lg font-semibold w-10 text-center">{amount}</span>
          <button
            onClick={() => setAmount((a) => a + 1)}
            className="h-11 w-11 rounded-xl border border-[var(--line)] text-xl"
          >
            +
          </button>
          <span className="text-sm text-[var(--muted)]">
            {unit}
            {amount > 1 ? "s" : ""} each time
          </span>
        </div>
      </Field>

      <Field label="Times">
        <div className="space-y-2">
          {times.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="time"
                className={field}
                value={t}
                onChange={(e) => setTime(i, e.target.value)}
              />
              {times.length > 1 && (
                <button
                  onClick={() => removeTime(i)}
                  className="h-11 w-11 rounded-xl border border-[var(--line)] text-[var(--muted)]"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addTime}
            className="text-sm text-[var(--primary)] font-medium"
          >
            + Add another time
          </button>
        </div>
      </Field>

      <Field label="Days">
        <div className="flex gap-1.5">
          {DOW.map((d, i) => {
            const on = days.length === 0 || days.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggleDay(i)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium border ${
                  days.includes(i)
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "border-[var(--line)] text-[var(--muted)]"
                }`}
              >
                {d[0]}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-[var(--muted)] mt-1.5">
          {days.length === 0 ? "Every day (none selected = daily)" : `${days.length} day(s) selected`}
        </p>
      </Field>

      <Field label="Color">
        <div className="flex gap-2 flex-wrap">
          {MED_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-9 w-9 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-[var(--ink)]" : ""}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Pills in stock (optional)">
          <input
            type="number"
            inputMode="numeric"
            className={field}
            placeholder="—"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </Field>
        <label className="flex items-end pb-3 gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={withFood}
            onChange={(e) => setWithFood(e.target.checked)}
            className="h-5 w-5 accent-[var(--primary)]"
          />
          <span className="text-sm">Take with food</span>
        </label>
      </div>

      <Field label="Notes (optional)">
        <textarea
          className={field + " min-h-20 resize-none"}
          placeholder="Anything to remember…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => router.back()}
          className="flex-1 rounded-xl border border-[var(--line)] py-3.5 font-medium text-[var(--muted)]"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={!name.trim()}
          className="flex-1 rounded-xl bg-[var(--primary)] text-white py-3.5 font-semibold disabled:opacity-40"
        >
          Save
        </button>
      </div>

      {existing && (
        <button
          onClick={() => {
            removeMed(existing.id);
            router.push("/meds");
          }}
          className="w-full text-center text-sm text-[var(--danger)] font-medium pt-2"
        >
          Delete medication
        </button>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--ink)] mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
