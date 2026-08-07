import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "link";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500 disabled:bg-primary-300",
  secondary:
    "bg-white dark:bg-[var(--bg-secondary)] text-slate-700 dark:text-[var(--text-body)] border border-slate-200 dark:border-[var(--border)] hover:bg-slate-50 dark:hover:bg-[var(--bg-app)] active:bg-slate-100 focus-visible:ring-primary-500 disabled:opacity-50",
  danger:
    "bg-danger-600 text-dark hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-danger-500 disabled:bg-danger-300",
  ghost:
    "text-slate-600 dark:text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-[var(--bg-secondary)] hover:text-slate-900 dark:hover:text-[var(--text-primary)] focus-visible:ring-slate-400 disabled:opacity-40",
  link: "text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline focus-visible:ring-primary-500 disabled:opacity-40 p-0 h-auto",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8  px-3   text-sm  font-medium gap-1.5",
  md: "h-10 px-4   text-sm  font-medium gap-2",
  lg: "h-11 px-5   text-base font-medium gap-2",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        "disabled:pointer-events-none select-none",
        variantClasses[variant],
        variant !== "link" && sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  ),
);
Button.displayName = "Button";
