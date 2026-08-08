import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Calendar, Mail, Phone, ShieldCheck, UserCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useEmployeeDetail } from '../hooks/useEmployeeDetail';
import { useUpdateUserAccess } from '../hooks/useEmployeeMutations';
import { formatDate, getErrorMessage } from '@/lib/utils';
import type { EmployeeDetail, UserRole } from '@/types/employee.types';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: number | null;
}

const roleOptions: UserRole[] = ['USER', 'ADMIN'];

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  onClose,
  employeeId,
}) => {
  const { data, isLoading, isError, error } = useEmployeeDetail(employeeId, isOpen);
  const updateUserAccessMutation = useUpdateUserAccess();

  const employee = data as EmployeeDetail | undefined;
  const [draftRole, setDraftRole] = useState<UserRole | null>(null);
  const [draftIsActive, setDraftIsActive] = useState<boolean | null>(null);
  const [savedRole, setSavedRole] = useState<UserRole | null>(null);
  const [savedIsActive, setSavedIsActive] = useState<boolean | null>(null);

  useEffect(() => {
    if (employee) {
      setDraftRole(employee.role);
      setDraftIsActive(employee.isActive);
      setSavedRole(employee.role);
      setSavedIsActive(employee.isActive);
    } else {
      setDraftRole(null);
      setDraftIsActive(null);
      setSavedRole(null);
      setSavedIsActive(null);
    }
  }, [employee]);

  const statusVariant = useMemo(() => {
    if (draftIsActive === null) return 'default';
    return draftIsActive ? 'success' : 'danger';
  }, [draftIsActive]);

  const hasRoleChanges = draftRole !== null && savedRole !== null && draftRole !== savedRole;
  const hasStatusChanges = draftIsActive !== null && savedIsActive !== null && draftIsActive !== savedIsActive;

  const handleRoleChange = (role: UserRole) => {
    if (!employee) return;
    setDraftRole(role);
  };

  const handleSaveAccess = () => {
    if (!employee || draftRole === null || draftIsActive === null) return;

    const roleChanged = draftRole !== savedRole;
    const statusChanged = draftIsActive !== savedIsActive;

    if (!roleChanged && !statusChanged) return;

    updateUserAccessMutation.mutate(
      {
        userId: employee.userId,
        role: draftRole,
        isActive: draftIsActive,
      },
      {
        onSuccess: (updatedUser) => {
          setDraftRole(updatedUser.role);
          setDraftIsActive(updatedUser.isActive);
          setSavedRole(updatedUser.role);
          setSavedIsActive(updatedUser.isActive);
        },
      },
    );
  };

  const handleStatusChange = (isActive: boolean) => {
    if (!employee) return;
    setDraftIsActive(isActive);
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Karyawan"
      description={employee ? `${employee.name} • ${employee.employeeCode}` : 'Memuat detail karyawan...'}
      size="lg"
      footer={
        employee ? (
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(hasStatusChanges || hasRoleChanges) && (
                <Button
                  variant="primary"
                  size="md"
                  loading={updateUserAccessMutation.isPending}
                  onClick={handleSaveAccess}
                >
                  Simpan Perubahan
                </Button>
              )}
              <Button variant="secondary" size="md" onClick={onClose}>
                Tutup
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {isLoading && (
        <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-500">
          Memuat detail karyawan...
        </div>
      )}

      {!isLoading && isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {getErrorMessage(error)}
        </div>
      )}

      {!isLoading && employee && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <UserCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{employee.name}</h3>
                <p className="text-sm text-slate-500">{employee.employeeCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={statusVariant}>{draftIsActive ?? employee.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
              <Badge variant={(draftRole ?? employee.role) === 'ADMIN' ? 'info' : 'default'}>{draftRole ?? employee.role}</Badge>
            </div>
          </div>

          {updateUserAccessMutation.isPending && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Menyimpan perubahan akun…
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Briefcase className="h-4 w-4" />
                Informasi Umum
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-slate-400" />
                  <span>{employee.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span>{employee.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{employee.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{employee.joinDate ? formatDate(employee.joinDate) : '—'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <ShieldCheck className="h-4 w-4" />
                Akun & Peran
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Status Akun
                  </label>
                  <div className="flex items-center gap-4 rounded-md border border-slate-200 bg-slate-50 p-2">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="user-status"
                        value="active"
                        checked={draftIsActive ?? employee.isActive}
                        onChange={() => handleStatusChange(true)}
                        disabled={updateUserAccessMutation.isPending}
                      />
                      Aktif
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="user-status"
                        value="inactive"
                        checked={!(draftIsActive ?? employee.isActive)}
                        onChange={() => handleStatusChange(false)}
                        disabled={updateUserAccessMutation.isPending}
                      />
                      Nonaktif
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Ubah Role
                  </label>
                  <select
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-70"
                    value={draftRole ?? employee.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    disabled={updateUserAccessMutation.isPending}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-3">
              <span>Dibuat</span>
              <span>{employee.createdAt ? formatDate(employee.createdAt) : '—'}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span>Terakhir diperbarui</span>
              <span>{employee.updatedAt ? formatDate(employee.updatedAt) : '—'}</span>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
