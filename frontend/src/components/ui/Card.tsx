import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  className,
  children,
  action,
  noPadding,
}) => (
  <div
    className={cn(
      "rounded-lg bg-white dark:bg-[var(--bg-surface)] transition-colors",
      className,
    )}
    style={{ border: "1px solid var(--border)" }}
  >
    {(title || action) && (
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          {title && (
            <h3
              className="text-base font-semibold"
              style={{ color: "var(--text-heading)" }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p
              className="mt-0.5 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              {description}
            </p>
          )}
        </div>
        {action && <div className="ml-4 shrink-0">{action}</div>}
      </div>
    )}
    <div className={noPadding ? "" : "p-5"}>{children}</div>
  </div>
);

export const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor?: "primary" | "success" | "warning" | "danger" | "info";
  trend?: string;
  trendPositive?: boolean;
}> = ({ label, value, icon, iconColor = "primary", trend, trendPositive }) => {
  const iconBg: Record<string, string> = {
    primary:
      "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400",
    success:
      "bg-success-50 text-success-600 dark:bg-green-900/20 dark:text-green-400",
    warning:
      "bg-warning-50 text-warning-600 dark:bg-amber-900/20 dark:text-amber-400",
    danger:
      "bg-danger-50  text-danger-600  dark:bg-red-900/20   dark:text-red-400",
    info: "bg-info-50    text-info-600    dark:bg-sky-900/20   dark:text-sky-400",
  };

  return (
    <div
      className="rounded-lg bg-white dark:bg-[var(--bg-surface)] p-5 transition-colors"
      style={{ border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          {label}
        </p>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md shrink-0",
            iconBg[iconColor],
          )}
        >
          {icon}
        </div>
      </div>
      <p
        className="mt-3 text-[28px] font-bold leading-none"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
      {trend && (
        <p
          className="mt-2 text-xs font-medium"
          style={{
            color: trendPositive
              ? "#16A34A"
              : trendPositive === false
                ? "#DC2626"
                : "var(--text-muted)",
          }}
        >
          {trend}
        </p>
      )}
    </div>
  );
};
