import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      required,
      leftElement,
      rightElement,
      id,
      style,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium leading-[18px]"
            style={{ color: "var(--text-body)" }}
          >
            {label}
            {required && <span className="ml-0.5 text-danger-600">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftElement && (
            <div
              className="pointer-events-none absolute left-3 flex items-center"
              style={{ color: "var(--text-placeholder)" }}
            >
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-10 w-full rounded-md border px-3 text-sm",
              "bg-white dark:bg-[var(--bg-secondary)]",
              "placeholder:text-slate-400 dark:placeholder:text-[var(--text-placeholder)]",
              "transition-colors duration-150",
              error
                ? "border-danger-500 focus:border-danger-500 focus:outline-none focus:ring-2 focus:ring-danger-100 dark:focus:ring-danger-900/30"
                : [
                    "border-slate-300 dark:border-[var(--border)]",
                    "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-50 dark:focus:ring-primary-900/20",
                  ].join(" "),
              "disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-[var(--bg-secondary)] disabled:opacity-60",
              leftElement && "pl-9",
              rightElement && "pr-9",
              className,
            )}
            style={{
              color: "var(--text-primary)",
              ...style,
            }}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            {...props}
          />

          {rightElement && (
            <div
              className="absolute right-3 flex items-center"
              style={{ color: "var(--text-placeholder)" }}
            >
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-danger-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
