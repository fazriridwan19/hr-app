import React, { useEffect, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Plus, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  useCreateEmployee,
  useUpdateEmployee,
} from "../hooks/useEmployeeMutations";
import { getErrorMessage } from "@/lib/utils";
import type { Employee } from "@/types/employee.types";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  position: z.string().min(2, "Jabatan minimal 2 karakter"),
  phone: z.string().optional(),
  joinDate: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const isEdit = !!employee;
  const formId = useId();

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const activeMutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: employee?.name ?? "",
        position: employee?.position ?? "",
        phone: employee?.phone ?? "",
        joinDate: employee?.joinDate ?? "",
      });
      createMutation.reset();
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, employee]);

  const onSubmit = (data: FormData) => {
    const payload = {
      name: data.name,
      position: data.position,
      phone: data.phone || undefined,
      joinDate: data.joinDate || undefined,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: employee.id, data: payload },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}
      description={
        isEdit
          ? `Mengubah data: ${employee?.name}`
          : "Isi informasi karyawan baru"
      }
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={activeMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            size="md"
            loading={activeMutation.isPending}
            disabled={isEdit && !isDirty}
            leftIcon={
              isEdit ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )
            }
          >
            {isEdit ? "Simpan Perubahan" : "Tambah Karyawan"}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Nama Lengkap"
              required
              placeholder="Nama karyawan"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>
          <div className="col-span-2">
            <Input
              label="Jabatan / Posisi"
              required
              placeholder="Contoh: Software Engineer"
              error={errors.position?.message}
              {...register("position")}
            />
          </div>
          <Input
            label="Nomor Telepon"
            placeholder="+62 812 xxxx xxxx"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Tanggal Bergabung"
            type="date"
            error={errors.joinDate?.message}
            {...register("joinDate")}
          />
        </div>

        {activeMutation.isError && (
          <div
            className="flex items-start gap-3 rounded-md px-4 py-3 text-sm"
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#B91C1C",
            }}
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{getErrorMessage(activeMutation.error)}</span>
          </div>
        )}
      </form>
    </Modal>
  );
};
