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
    <div className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100/80 p-0.5 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
      {themes.map((t) => {
        const isActive = theme === t.id || (!theme && t.id === "system");
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={`rounded-full px-2.5 py-1 transition ${
              isActive
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-100 dark:text-slate-900 dark:ring-slate-300"
                : "hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}


