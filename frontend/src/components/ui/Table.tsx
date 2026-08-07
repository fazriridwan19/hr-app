import React from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  rowKey?: (row: T) => string | number;
  className?: string;
}

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div
          className="h-4 rounded animate-pulse"
          style={{
            background: "var(--border)",
            width: i === 0 ? "60%" : "80%",
          }}
        />
      </td>
    ))}
  </tr>
);

export function Table<T extends object>({
  columns,
  data,
  loading = false,
  emptyText = "Tidak ada data",
  rowKey,
  className,
}: Readonly<TableProps<T>>) {
  const renderBody = () => {
    if (loading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <SkeletonRow key={i} cols={columns.length} />
      ));
    }

    if (data.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.length}
            className="py-16 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            {emptyText}
          </td>
        </tr>
      );
    }

    return data.map((row, i) => (
      <tr
        key={rowKey ? rowKey(row) : i}
        className="transition-colors hover:bg-slate-50 dark:hover:bg-[var(--bg-secondary)]"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {columns.map((col) => (
          <td
            key={col.key}
            className={cn("px-4 py-3.5 text-sm", col.className)}
            style={{ color: "var(--text-body)", minHeight: "56px" }}
          >
            {col.render
              ? col.render(row)
              : String((row as Record<string, unknown>)[col.key] ?? "—")}
          </td>
        ))}
      </tr>
    ));
  };

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full min-w-full border-collapse">
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--border)",
              background: "var(--bg-app)",
            }}
          >
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide",
                  col.headerClassName,
                )}
                style={{ color: "var(--text-secondary)", width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
    </div>
  );
}
