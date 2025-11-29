"use client";

import { useTheme } from "next-themes";

const themes = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" }
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 p-0.5 text-xs text-slate-300 shadow-sm">
      {themes.map((t) => {
        const isActive = theme === t.id || (!theme && t.id === "system");
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={`rounded-full px-2.5 py-1 transition ${
              isActive
                ? "bg-slate-100 text-slate-900"
                : "hover:bg-slate-800 hover:text-slate-50"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}


