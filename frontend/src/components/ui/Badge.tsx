import React from "react";
import { cn } from "@/lib/utils";
import type {
  AttendanceType,
  AttendanceStatus,
} from "@/types/attendance.types";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "processing"
  | "draft";

const variantClasses: Record<BadgeVariant, string> = {
  draft: "bg-slate-100   text-black dark:bg-slate-700/40   dark:text-white",
  processing:
    "bg-primary-100 text-black dark:bg-primary-900/30 dark:text-white",
  info: "bg-info-50     text-black dark:bg-sky-900/30     dark:text-white",
  success: "bg-success-100 text-black dark:bg-green-900/30  dark:text-white",
  warning: "bg-warning-100 text-black dark:bg-amber-900/30  dark:text-white",
  danger: "bg-danger-100  text-black dark:bg-red-900/30    dark:text-white",
  default: "bg-slate-100   text-black dark:bg-slate-700/40   dark:text-white",
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  className,
  children,
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-4",
      variantClasses[variant],
      className,
    )}
  >
    {children}
  </span>
);

export const AttendanceStatusBadge: React.FC<{ status: AttendanceStatus }> = ({
  status,
}) => {
  const map: Record<
    AttendanceStatus,
    { variant: BadgeVariant; label: string }
  > = {
    PENDING: { variant: "warning", label: "Pending" },
    COMPLETED: { variant: "success", label: "Selesai" },
    FAILED: { variant: "danger", label: "Gagal" },
  };
  const { variant, label } = map[status] ?? {
    variant: "default",
    label: status,
  };
  return <Badge variant={variant}>{label}</Badge>;
};

export const AttendanceTypeBadge: React.FC<{ type: AttendanceType }> = ({
  type,
}) => {
  const map: Record<AttendanceType, { variant: BadgeVariant; label: string }> =
    {
      CLOCK_IN: { variant: "processing", label: "Clock In" },
      CLOCK_OUT: { variant: "draft", label: "Clock Out" },
    };
  const { variant, label } = map[type] ?? { variant: "default", label: type };
  return <Badge variant={variant}>{label}</Badge>;
};
