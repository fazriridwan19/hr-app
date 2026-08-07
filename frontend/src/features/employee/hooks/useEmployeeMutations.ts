import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApiService } from '@/api/employee.api';
import type {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateUserAccountDto,
} from '@/types/employee.types';

export const useCreateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeeApiService.createEmployee(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useUpdateEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeDto }) =>
      employeeApiService.updateEmployee(id, data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useDeleteEmployee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => employeeApiService.deleteEmployee(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useCreateUserAccount = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserAccountDto) => employeeApiService.createUserAccount(data),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['employees'] }),
  });
};

export const useUpdateUserRole = () =>
  useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: 'ADMIN' | 'USER' }) =>
      employeeApiService.updateUserRole(userId, role),
  });

export const useUpdateUserStatus = () =>
  useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      employeeApiService.updateUserStatus(userId, isActive),
  });
