import React from "react";
import { ExternalLink } from "lucide-react";
import { Table, type Column } from "@/components/ui/Table";
import {
  AttendanceStatusBadge,
  AttendanceTypeBadge,
} from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate, formatTime } from "@/lib/utils";
import type { Attendance, PaginatedResponse } from "@/types/attendance.types";

interface AttendanceTableProps {
  data?: PaginatedResponse<Attendance>;
  loading?: boolean;
  page: number;
  onPageChange: (page: number) => void;
  showEmployee?: boolean;
}

const truncateWords = (text: string, count: number): string => {
  const words = text.trim().split(/\s+/);
  if (words.length <= count) return text;
  return `${words.slice(0, count).join(" ")}...`;
};

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  data,
  loading,
  page,
  onPageChange,
  showEmployee = false,
}) => {
  const columns: Column<Attendance>[] = [
    ...(showEmployee
      ? [
          {
            key: "employeeName",
            header: "Karyawan",
            render: (row: Attendance) => (
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-heading)" }}
                >
                  {row.employeeName}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {row.employeeCode}
                </p>
              </div>
            ),
          } as Column<Attendance>,
        ]
      : []),
    {
      key: "clockDate",
      header: "Tanggal",
      render: (row) => (
        <span className="text-sm" style={{ color: "var(--text-body)" }}>
          {formatDate(row.clockDate)}
        </span>
      ),
    },
    {
      key: "clockTime",
      header: "Jam",
      render: (row) => (
        <span
          className="font-mono text-sm font-medium tabular"
          style={{ color: "var(--text-heading)" }}
        >
          {formatTime(row.clockTime)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      render: (row) => <AttendanceTypeBadge type={row.type} />,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <AttendanceStatusBadge status={row.status} />,
    },
    {
      key: "notes",
      header: "Catatan",
      render: (row) => {
        if (!row.notes) {
          return (
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              —
            </span>
          );
        }

        const preview = truncateWords(row.notes, 5);
        return (
          <span
            className="text-sm text-slate-700 dark:text-slate-200"
            title={row.notes}
            style={{ cursor: row.notes ? "help" : "default" }}
          >
            {preview}
          </span>
        );
      },
    },
    {
      key: "photoUrl",
      header: "Foto",
      render: (row) =>
        row.photoUrl ? (
          <a
            href={`http://localhost:3001${row.photoUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Lihat
          </a>
        ) : (
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            —
          </span>
        ),
    },
  ];

  return (
    <div>
      <Table<Attendance>
        columns={columns}
        data={data?.data ?? []}
        loading={loading}
        emptyText="Belum ada data absensi"
        rowKey={(row) => row.id}
      />
      {data && (
        <Pagination
          page={page}
          totalPages={data.meta.totalPage}
          total={data.meta.totalData}
          limit={data.meta.limit}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};
