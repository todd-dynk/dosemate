"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useMeds } from "@/lib/useStore";
import { MedForm } from "@/components/MedForm";

function EditInner() {
  const id = useSearchParams().get("id") ?? "";
  const { meds, ready } = useMeds();
  const med = meds.find((m) => m.id === id);

  if (!ready) return null;
  if (!med)
    return (
      <div className="px-6 py-16 text-center text-[var(--muted)]">
        Medication not found.
      </div>
    );
  return <MedForm existing={med} />;
}

export default function EditMedPage() {
  return (
    <Suspense fallback={null}>
      <EditInner />
    </Suspense>
  );
}
