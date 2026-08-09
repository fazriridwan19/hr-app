import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApiService } from "@/api/employee.api";
import type {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateUserAccountDto,
} from "@/types/employee.types";

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeDto) =>
      employeeApiService.createEmployee(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeDto }) =>
      employeeApiService.updateEmployee(id, data),
    onSuccess: (updatedEmployee, { id }) => {
      void qc.setQueryData(["employee-detail", id], (prev: unknown) => {
        if (!prev || typeof prev !== "object") return updatedEmployee;

        return {
          ...(prev as Record<string, unknown>),
          ...(updatedEmployee as unknown as Record<string, unknown>),
          updatedAt: new Date().toISOString(),
        };
      });

      void qc.invalidateQueries({ queryKey: ["employees"] });
      void qc.invalidateQueries({ queryKey: ["employee-detail", id] });
    },
  });
};

export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeeApiService.deleteEmployee(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useCreateUserAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserAccountDto) =>
      employeeApiService.createUserAccount(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["employees"] }),
  });
};

export const useUpdateUserAccess = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
      isActive,
    }: {
      userId: number;
      role: "ADMIN" | "USER";
      isActive: boolean;
    }) => employeeApiService.updateUserAccess(userId, { role, isActive }),
    onSuccess: (updatedUser, { userId }) => {
      void qc.setQueryData(["employee-detail", userId], (prev: unknown) => {
        if (!prev || typeof prev !== "object") return prev;

        return {
          ...(prev as Record<string, unknown>),
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          updatedAt: new Date().toISOString(),
        };
      });

      void qc.invalidateQueries({ queryKey: ["employees"] });
      void qc.invalidateQueries({ queryKey: ["employee-detail", userId] });
    },
  });
};

export const useUpdateUserRole = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: number;
      role: "ADMIN" | "USER";
    }) => employeeApiService.updateUserRole(userId, role),
    onSuccess: (updatedUser, { userId }) => {
      void qc.setQueryData(["employee-detail", userId], (prev: unknown) => {
        if (!prev || typeof prev !== "object") return prev;

        return {
          ...(prev as Record<string, unknown>),
          role: updatedUser.role,
          updatedAt: new Date().toISOString(),
        };
      });

      void qc.invalidateQueries({ queryKey: ["employees"] });
      void qc.invalidateQueries({ queryKey: ["employee-detail", userId] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      employeeApiService.updateUserStatus(userId, isActive),
    onSuccess: (updatedUser, { userId }) => {
      void qc.setQueryData(["employee-detail", userId], (prev: unknown) => {
        if (!prev || typeof prev !== "object") return prev;

        return {
          ...(prev as Record<string, unknown>),
          isActive: updatedUser.isActive,
          updatedAt: new Date().toISOString(),
        };
      });

      void qc.invalidateQueries({ queryKey: ["employees"] });
      void qc.invalidateQueries({ queryKey: ["employee-detail", userId] });
    },
  });
};
