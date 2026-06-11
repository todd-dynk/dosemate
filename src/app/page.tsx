"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMeds } from "@/lib/useStore";
import { scheduleFor, fmtTime, ScheduledDose } from "@/lib/store";

export default function TodayPage() {
  const { meds, logs, ready, setDose, today } = useMeds();

  const sched = useMemo(
    () => scheduleFor(today, meds, logs),
    [today, meds, logs]
  );

  const taken = sched.filter((s) => s.status === "taken").length;
  const total = sched.length;
  const pct = total ? Math.round((taken / total) * 100) : 0;

  const niceDate = new Date(today + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // group by time
  const groups = useMemo(() => {
    const m = new Map<string, ScheduledDose[]>();
    for (const s of sched) {
      if (!m.has(s.time)) m.set(s.time, []);
      m.get(s.time)!.push(s);
    }
    return [...m.entries()];
  }, [sched]);

  return (
    <div>
      <header className="px-5 pt-8 pb-4 bg-[var(--primary)] text-white rounded-b-3xl">
        <div className="text-sm opacity-90">{niceDate}</div>
        <h1 className="text-2xl font-bold mt-1">Today&apos;s Doses</h1>
        {total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="opacity-90">
                {taken} of {total} taken
              </span>
              <span className="font-semibold">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/25 overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {!ready ? null : total === 0 ? (
        <Empty />
      ) : (
        <div className="px-4 py-5 space-y-6">
          {groups.map(([time, items]) => (
            <div key={time}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-sm font-semibold text-[var(--ink)]">
                  {fmtTime(time)}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  {items.filter((i) => i.status === "taken").length}/{items.length}
                </span>
                <div className="flex-1 h-px bg-[var(--line)]" />
              </div>
              <div className="space-y-2">
                {items.map((s) => (
                  <DoseCard
                    key={s.key}
                    dose={s}
                    onTake={() =>
                      setDose(
                        s.medId,
                        s.date,
                        s.time,
                        s.status === "taken" ? null : "taken"
                      )
                    }
                    onSkip={() =>
                      setDose(
                        s.medId,
                        s.date,
                        s.time,
                        s.status === "skipped" ? null : "skipped"
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DoseCard({
  dose,
  onTake,
  onSkip,
}: {
  dose: ScheduledDose;
  onTake: () => void;
  onSkip: () => void;
}) {
  const { med, status } = dose;
  const done = status === "taken";
  const skipped = status === "skipped";
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl bg-[var(--card)] border p-3 transition ${
        done ? "border-[var(--good)]/40" : skipped ? "opacity-60" : "border-[var(--line)]"
      }`}
    >
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center text-white text-lg shrink-0"
        style={{ background: med.color }}
      >
        💊
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-semibold truncate ${done ? "line-through text-[var(--muted)]" : ""}`}>
          {med.name}
        </div>
        <div className="text-xs text-[var(--muted)]">
          {med.amount} {med.unit}
          {med.amount > 1 ? "s" : ""} · {med.strength}
          {med.withFood ? " · with food" : ""}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSkip}
          className={`h-9 w-9 rounded-full border flex items-center justify-center text-sm ${
            skipped
              ? "bg-[var(--warn)] text-white border-[var(--warn)]"
              : "border-[var(--line)] text-[var(--muted)]"
          }`}
          aria-label="Skip dose"
        >
          ✕
        </button>
        <button
          onClick={onTake}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-lg pop ${
            done
              ? "bg-[var(--good)] text-white"
              : "bg-[var(--primary-soft)] text-[var(--primary-ink)]"
          }`}
          aria-label="Take dose"
        >
          ✓
        </button>
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="px-6 py-16 text-center slide-up">
      <div className="text-5xl mb-3">💊</div>
      <h2 className="font-semibold text-lg">No medications yet</h2>
      <p className="text-sm text-[var(--muted)] mt-1 mb-5">
        Add your first medication to start tracking your daily doses.
      </p>
      <Link
        href="/meds/new"
        className="inline-block rounded-xl bg-[var(--primary)] text-white font-medium px-5 py-3"
      >
        + Add a medication
      </Link>
    </div>
  );
}
