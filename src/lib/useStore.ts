"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Medication,
  DoseLog,
  DoseStatus,
  loadMeds,
  saveMeds,
  loadLogs,
  saveLogs,
  todayStr,
} from "./store";

export function useMeds() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<DoseLog[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMeds(loadMeds());
    setLogs(loadLogs());
    setReady(true);
  }, []);

  const upsertMed = useCallback((med: Medication) => {
    setMeds((prev) => {
      const exists = prev.some((m) => m.id === med.id);
      const next = exists ? prev.map((m) => (m.id === med.id ? med : m)) : [...prev, med];
      saveMeds(next);
      return next;
    });
  }, []);

  const removeMed = useCallback((id: string) => {
    setMeds((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveMeds(next);
      return next;
    });
  }, []);

  const setDose = useCallback(
    (medId: string, date: string, time: string, status: DoseStatus | null) => {
      const id = `${medId}|${date}|${time}`;
      setLogs((prev) => {
        let next: DoseLog[];
        if (status === null) {
          next = prev.filter((l) => l.id !== id);
        } else {
          const log: DoseLog = { id, medId, date, time, status, at: Date.now() };
          next = prev.some((l) => l.id === id)
            ? prev.map((l) => (l.id === id ? log : l))
            : [...prev, log];
          // decrement stock when a med dose is taken today
        }
        saveLogs(next);
        return next;
      });
    },
    []
  );

  return { meds, logs, ready, upsertMed, removeMed, setDose, today: todayStr() };
}
