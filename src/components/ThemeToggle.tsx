"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-lg p-2 hover:bg-white/20 transition"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
