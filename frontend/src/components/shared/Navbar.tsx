import { authApi } from "@/api/auth.api";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import React from "react";

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, clearAuth } = useAuth();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      void router.navigate({ to: "/login" });
    },
  });

  const initials =
    user?.name
      ?.split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() ?? "U";

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center bg-white dark:bg-[var(--bg-surface)] px-6 transition-colors shrink-0"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <button
        type="button"
        onClick={onMenuClick}
        className="mr-3 rounded-md p-2 transition-colors hover:bg-slate-100 dark:hover:bg-[var(--bg-secondary)] lg:hidden"
        aria-label="Buka menu"
        style={{ color: "var(--text-muted)" }}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600 text-white text-sm font-bold">
          HR
        </div>
        <span
          className="text-base font-semibold"
          style={{ color: "var(--text-heading)" }}
        >
          HR System
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* <ThemeToggle /> */}
        <div className="h-6 w-px bg-slate-200 dark:bg-[var(--border)]" />
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold shrink-0"
            style={{
              background: "var(--primary-light)",
              color: "var(--primary)",
            }}
          >
            {initials}
          </div>
          <div className="hidden sm:block">
            <p
              className="text-sm font-medium leading-tight"
              style={{ color: "var(--text-heading)" }}
            >
              {user?.name}
            </p>
            <p
              className="text-xs leading-tight"
              style={{ color: "var(--text-muted)" }}
            >
              {user?.role === "ADMIN" ? "Administrator" : "Karyawan"}
            </p>
          </div>
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-[var(--border)]" />
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-[var(--bg-secondary)] disabled:opacity-50 disabled:pointer-events-none"
          style={{ color: "var(--text-secondary)" }}
          aria-label="Keluar"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
