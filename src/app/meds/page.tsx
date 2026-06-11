"use client";

import Link from "next/link";
import { useMeds } from "@/lib/useStore";
import { fmtTime } from "@/lib/store";

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function MedsPage() {
  const { meds, ready } = useMeds();

  return (
    <div>
      <header className="px-5 pt-8 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Medications</h1>
        <Link
          href="/meds/new"
          className="rounded-full bg-[var(--primary)] text-white h-10 w-10 flex items-center justify-center text-xl leading-none"
          aria-label="Add medication"
        >
          +
        </Link>
      </header>

      {!ready ? null : meds.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="text-5xl mb-3">💊</div>
          <p className="text-sm text-[var(--muted)] mb-5">No medications added yet.</p>
          <Link
            href="/meds/new"
            className="inline-block rounded-xl bg-[var(--primary)] text-white font-medium px-5 py-3"
          >
            + Add a medication
          </Link>
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {meds.map((m) => (
            <Link
              key={m.id}
              href={`/meds/edit?id=${m.id}`}
              className="flex items-center gap-3 rounded-2xl bg-[var(--card)] border border-[var(--line)] p-3.5"
            >
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-white text-xl shrink-0"
                style={{ background: m.color }}
              >
                💊
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-[var(--muted)]">
                  {m.strength} · {m.amount} {m.unit}
                  {m.amount > 1 ? "s" : ""} · {m.times.map(fmtTime).join(", ")}
                </div>
                <div className="flex gap-1 mt-1.5">
                  {m.daysOfWeek.length === 0 ? (
                    <span className="text-[10px] text-[var(--primary-ink)] bg-[var(--primary-soft)] rounded px-1.5 py-0.5">
                      Every day
                    </span>
                  ) : (
                    DOW.map((d, i) => (
                      <span
                        key={i}
                        className={`text-[10px] rounded px-1 py-0.5 ${
                          m.daysOfWeek.includes(i)
                            ? "text-[var(--primary-ink)] bg-[var(--primary-soft)]"
                            : "text-[var(--muted)]"
                        }`}
                      >
                        {d}
                      </span>
                    ))
                  )}
                </div>
              </div>
              {typeof m.stockCount === "number" && (
                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-semibold ${
                      m.stockCount <= 5 ? "text-[var(--danger)]" : "text-[var(--ink)]"
                    }`}
                  >
                    {m.stockCount}
                  </div>
                  <div className="text-[10px] text-[var(--muted)]">left</div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
