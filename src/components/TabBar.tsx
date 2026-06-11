"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Today", icon: "✓" },
  { href: "/meds", label: "Meds", icon: "💊" },
  { href: "/history", label: "History", icon: "📈" },
];

export function TabBar() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--card)] border-t border-[var(--line)] z-40">
      <div className="flex">
        {tabs.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className="flex-1 flex flex-col items-center gap-1 py-3"
              style={{ color: active ? "var(--primary)" : "var(--muted)" }}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              <span className="text-[11px] font-medium">{t.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
