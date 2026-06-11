"use client";

import { useMemo, useState } from "react";
import { useMeds } from "@/lib/useStore";
import { adherence } from "@/lib/store";

export default function HistoryPage() {
  const { meds, logs, ready } = useMeds();
  const [range, setRange] = useState<7 | 30>(7);

  const data = useMemo(() => adherence(meds, logs, range), [meds, logs, range]);
  const maxTotal = Math.max(1, ...data.perDay.map((d) => d.total));

  return (
    <div>
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold">History</h1>
        <p className="text-sm text-[var(--muted)]">Your medication adherence.</p>
      </header>

      <div className="px-5 flex gap-2 mb-4">
        {([7, 30] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border ${
              range === r
                ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                : "border-[var(--line)] text-[var(--muted)]"
            }`}
          >
            {r} days
          </button>
        ))}
      </div>

      {!ready ? null : meds.length === 0 ? (
        <div className="px-6 py-16 text-center text-[var(--muted)]">
          Add medications to see your history.
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {/* Big adherence number */}
          <div className="rounded-2xl bg-[var(--card)] border border-[var(--line)] p-5 text-center">
            <div className="text-5xl font-bold text-[var(--primary)]">{data.pct}%</div>
            <div className="text-sm text-[var(--muted)] mt-1">
              {data.taken} of {data.total} doses taken · last {range} days
            </div>
          </div>

          {/* Bar chart */}
          <div className="rounded-2xl bg-[var(--card)] border border-[var(--line)] p-5">
            <div className="text-sm font-semibold mb-4">Daily doses taken</div>
            <div className="flex items-end gap-1 h-32">
              {data.perDay.map((d) => {
                const h = (d.total / maxTotal) * 100;
                const takenH = d.total ? (d.taken / d.total) * h : 0;
                const dd = new Date(d.date + "T00:00:00");
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                    <div
                      className="w-full rounded-md bg-[var(--line)] relative flex items-end overflow-hidden"
                      style={{ height: `${Math.max(h, 4)}%` }}
                    >
                      <div
                        className="w-full bg-[var(--primary)] transition-all"
                        style={{ height: `${d.total ? (d.taken / d.total) * 100 : 0}%` }}
                      />
                    </div>
                    {range === 7 && (
                      <span className="text-[10px] text-[var(--muted)]">
                        {dd.toLocaleDateString("en-US", { weekday: "narrow" })}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Per-med streak-ish summary */}
          <div className="rounded-2xl bg-[var(--card)] border border-[var(--line)] p-5">
            <div className="text-sm font-semibold mb-3">By medication</div>
            <div className="space-y-3">
              {meds.map((m) => {
                const single = adherence([m], logs, range);
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ background: m.color }}
                    />
                    <span className="text-sm flex-1 truncate">{m.name}</span>
                    <div className="w-24 h-2 rounded-full bg-[var(--line)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--primary)]"
                        style={{ width: `${single.pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--muted)] w-9 text-right">
                      {single.pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[11px] text-[var(--muted)] text-center px-4 pt-1">
            DoseMate is a personal reminder &amp; logging tool, not medical advice.
            Always follow your doctor&apos;s and pharmacist&apos;s instructions.
          </p>
        </div>
      )}
    </div>
  );
}
