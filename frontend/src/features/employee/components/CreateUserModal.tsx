import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCreateUserAccount } from "../hooks/useEmployeeMutations";
import { getErrorMessage } from "@/lib/utils";
import type { Employee } from "@/types/employee.types";

const schema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "USER"]),
});

type FormData = z.infer<typeof schema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const mutation = useCreateUserAccount();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "USER" },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(
      {
        email: data.email,
        password: data.password,
        employeeId: employee.id,
        role: data.role,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Akun Login"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={mutation.isPending}>
            Buat Akun
          </Button>
        </>
      }
    >
      <div className="mb-4 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
        Membuat akun untuk:{" "}
        <span className="font-semibold">{employee.name}</span>
        <span className="ml-1 text-gray-500">({employee.employeeCode})</span>
      </div>
      <form className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          required
          placeholder="email@perusahaan.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Password Awal"
          type="password"
          required
          placeholder="Min. 6 karakter"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            className="h-10 rounded-md border border-gray-300 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            {...register("role")}
          >
            <option value="USER">USER — Karyawan</option>
            <option value="ADMIN">ADMIN — HRD</option>
          </select>
        </div>
        {mutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            {getErrorMessage(mutation.error)}
          </p>
        )}
      </form>
    </Modal>
  );
};
