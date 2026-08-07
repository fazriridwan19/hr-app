import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, Users, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  group?: string;
}

const navItems: NavItem[] = [
  {
    to: "/attendance",
    label: "Absensi",
    icon: <CalendarCheck className="h-5 w-5" />,
    group: "MENU",
  },
  {
    to: "/admin/attendance",
    label: "Monitoring Absensi",
    icon: <ClipboardList className="h-5 w-5" />,
    group: "ADMIN",
    adminOnly: true,
  },
  {
    to: "/admin/employees",
    label: "Data Karyawan",
    icon: <Users className="h-5 w-5" />,
    group: "ADMIN",
    adminOnly: true,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  const { isAdmin } = useAuth();
  const {
    location: { pathname },
  } = useRouterState();

  const items = navItems.filter((i) => !i.adminOnly || isAdmin);
  const groups = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group ?? "MENU";
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  const SidebarContent = (
    <nav
      className="flex h-full w-full flex-col bg-white dark:bg-[var(--bg-surface)] transition-colors"
      style={{ borderRight: "1px solid var(--border)" }}
      aria-label="Navigasi utama"
    >
      <div
        className="flex h-16 items-center gap-3 px-5 lg:hidden"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-600 text-white text-sm font-bold shrink-0">
          HR
        </div>
        <span
          className="text-base font-semibold"
          style={{ color: "var(--text-heading)" }}
        >
          HR System
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-md p-1 transition-colors hover:bg-slate-100 dark:hover:bg-[var(--bg-secondary)] lg:hidden"
          style={{ color: "var(--text-muted)" }}
          aria-label="Tutup sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {Object.entries(groups).map(([group, groupItems]) => (
          <div key={group}>
            <p
              className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              {group}
            </p>
            <ul className="space-y-0.5" role="list">
              {groupItems.map((item) => {
                const isActive =
                  pathname === item.to ||
                  (item.to !== "/attendance" && pathname.startsWith(item.to));

                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                        isActive
                          ? "bg-primary-50 text-primary-600 font-semibold dark:bg-primary-900/20 dark:text-primary-400"
                          : "hover:bg-slate-100 dark:hover:bg-[var(--bg-secondary)]",
                      )}
                      style={
                        !isActive
                          ? { color: "var(--text-secondary)" }
                          : undefined
                      }
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* Icon */}
                      <span
                        className={cn(
                          "shrink-0",
                          isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : "",
                        )}
                        style={
                          !isActive ? { color: "var(--text-muted)" } : undefined
                        }
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div
        className="px-4 py-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p
          className="text-xs text-center"
          style={{ color: "var(--text-muted)" }}
        >
          HR System v1.0
        </p>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="hidden w-60 shrink-0 lg:block">{SidebarContent}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-60 shadow-lg">
            {SidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
