import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface AttendanceFilterValues {
  date: string;
  employeeId: string;
  status: string;
}

interface AttendanceFiltersProps {
  values: AttendanceFilterValues;
  onChange: (values: AttendanceFilterValues) => void;
  onReset: () => void;
}

const statuses = [
  { value: "", label: "Semua Status" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "FAILED", label: "Gagal" },
];

export const AttendanceFilters: React.FC<AttendanceFiltersProps> = ({
  values,
  onChange,
  onReset,
}) => {
  const set =
    (key: keyof AttendanceFilterValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...values, [key]: e.target.value });

  const hasFilter = values.date || values.employeeId || values.status;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        type="date"
        value={values.date}
        onChange={set("date")}
        className="w-40"
        aria-label="Filter tanggal"
      />
      <Input
        type="number"
        placeholder="ID Karyawan"
        value={values.employeeId}
        onChange={set("employeeId")}
        className="w-40"
        leftElement={<Search className="h-4 w-4" />}
        aria-label="Filter employee ID"
      />
      <select
        value={values.status}
        onChange={set("status")}
        className="h-10 rounded-md border px-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-50"
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-muted)",
          color: "var(--text-body)",
        }}
        aria-label="Filter status"
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {hasFilter && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={<RotateCcw className="h-4 w-4" />}
        >
          Reset Filter
        </Button>
      )}
    </div>
  );
};
