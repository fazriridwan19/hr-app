import React from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { isDark, toggle } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative flex h-8 w-14 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 ${className ?? ""}`}
      style={{
        background: isDark ? "#4F46E5" : "var(--bg-secondary)",
        borderColor: isDark ? "#4338CA" : "var(--border)",
      }}
      aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      aria-pressed={isDark}
    >
      {/* Icons */}
      <Sun
        className="absolute left-1.5 h-3.5 w-3.5 transition-opacity"
        style={{
          color: isDark ? "rgba(255,255,255,0.4)" : "#D97706",
          opacity: isDark ? 0.4 : 1,
        }}
        aria-hidden="true"
      />
      <Moon
        className="absolute right-1.5 h-3.5 w-3.5 transition-opacity"
        style={{ color: "white", opacity: isDark ? 0.9 : 0.3 }}
        aria-hidden="true"
      />
      {/* Thumb */}
      <span
        className="absolute h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: isDark ? "translateX(24px)" : "translateX(2px)" }}
      />
    </button>
  );
};
