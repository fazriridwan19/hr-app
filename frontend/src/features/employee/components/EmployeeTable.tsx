import React, { useState } from "react";
import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import { Table, type Column } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { useDeleteEmployee } from "../hooks/useEmployeeMutations";
import { EmployeeModal } from "./EmployeeModal";
import { CreateUserModal } from "./CreateUserModal";
import { EmployeeDetailModal } from "./EmployeeDetailModal";
import { formatDate } from "@/lib/utils";
import type { Employee } from "@/types/employee.types";
import type { PaginatedMeta } from "@/types/attendance.types";

type PaginatedEmployees = { data: Employee[]; meta: PaginatedMeta };

interface EmployeeTableProps {
  data?: PaginatedEmployees;
  loading?: boolean;
  page: number;
  onPageChange: (p: number) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  data,
  loading,
  page,
  onPageChange,
}) => {
  const deleteMutation = useDeleteEmployee();
  const [detailTargetId, setDetailTargetId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [userTarget, setUserTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const columns: Column<Employee>[] = [
    {
      key: "employeeCode",
      header: "Kode",
      width: "120px",
      render: (row) => (
        <span className="font-mono text-sm font-medium text-primary-600 dark:text-primary-400">
          {row.employeeCode}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nama Karyawan",
      render: (row) => (
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-heading)" }}
        >
          {row.name}
        </span>
      ),
    },
    { key: "position", header: "Jabatan" },
    {
      key: "phone",
      header: "Telepon",
      render: (row) => (
        <span className="text-sm" style={{ color: "var(--text-body)" }}>
          {row.phone ?? "—"}
        </span>
      ),
    },
    {
      key: "joinDate",
      header: "Bergabung",
      render: (row) => (
        <span className="text-sm" style={{ color: "var(--text-body)" }}>
          {row.joinDate ? formatDate(row.joinDate) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "120px",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.hasAccount ? (
            <button
              type="button"
              onClick={() => setDetailTargetId(row.id)}
              className="rounded p-2 transition-colors hover:bg-sky-50 dark:hover:bg-sky-900/20"
              style={{ color: "var(--text-muted)" }}
              title="Lihat detail"
              aria-label={`Lihat detail ${row.name}`}
            >
              <Eye className="h-4 w-4" />
            </button>
          ) : null}

          {!row.hasAccount ? (
            <button
              type="button"
              onClick={() => setUserTarget(row)}
              className="rounded p-2 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20"
              style={{ color: "var(--text-muted)" }}
              title="Buat akun login"
              aria-label={`Buat akun untuk ${row.name}`}
            >
              <UserPlus className="h-4 w-4" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => setEditTarget(row)}
            className="rounded p-2 transition-colors hover:bg-slate-100 dark:hover:bg-[var(--bg-secondary)]"
            style={{ color: "var(--text-muted)" }}
            title="Edit karyawan"
            aria-label={`Edit ${row.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(row)}
            className="rounded p-2 transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            style={{ color: "var(--text-muted)" }}
            title="Hapus karyawan"
            aria-label={`Hapus ${row.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table<Employee>
        columns={columns}
        data={data?.data ?? []}
        loading={loading}
        emptyText="Belum ada data karyawan"
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

      <EmployeeDetailModal
        isOpen={detailTargetId !== null}
        onClose={() => setDetailTargetId(null)}
        employeeId={detailTargetId}
      />

      <EmployeeModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        employee={editTarget ?? undefined}
      />

      {userTarget && (
        <CreateUserModal
          isOpen={!!userTarget}
          onClose={() => setUserTarget(null)}
          employee={userTarget}
        />
      )}

      {/* Delete confirm */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Karyawan"
        description="Tindakan ini tidak dapat dibatalkan."
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              Hapus
            </Button>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--text-body)" }}>
          Apakah Anda yakin ingin menghapus karyawan{" "}
          <strong style={{ color: "var(--text-heading)" }}>
            {deleteTarget?.name}
          </strong>
        </p>
      </Modal>
    </>
  );
};
