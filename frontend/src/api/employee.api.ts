import { employeeApi } from './axios';
import type {
  Employee,
  EmployeeDetail,
  UserAccount,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateUserAccountDto,
  GetEmployeesParams,
  UserRole,
} from '@/types/employee.types';
import type { PaginatedMeta } from '@/types/attendance.types';

interface BackendResponse<T> {
  meta: { code: number; message: string | null };
  data: T;
}

interface BackendPaginatedResponse<T> {
  meta: PaginatedMeta;
  data: T[];
}

export interface PaginatedEmployees {
  data: Employee[];
  meta: PaginatedMeta;
}

export const employeeApiService = {
  getEmployees: async (params: GetEmployeesParams): Promise<PaginatedEmployees> => {
    const res = await employeeApi.get<BackendPaginatedResponse<Employee>>('/employees', { params });
    return { data: res.data.data, meta: res.data.meta };
  },

  getEmployeeById: async (id: number): Promise<EmployeeDetail> => {
    const res = await employeeApi.get<BackendResponse<EmployeeDetail>>(`/employees/${id}`);
    return res.data.data;
  },

  createEmployee: async (data: CreateEmployeeDto): Promise<Employee> => {
    const res = await employeeApi.post<BackendResponse<Employee>>('/employees', data);
    return res.data.data;
  },

  updateEmployee: async (id: number, data: UpdateEmployeeDto): Promise<Employee> => {
    const res = await employeeApi.put<BackendResponse<Employee>>(`/employees/${id}`, data);
    return res.data.data;
  },

  deleteEmployee: async (id: number): Promise<void> => {
    await employeeApi.delete(`/employees/${id}`);
  },

  createUserAccount: async (data: CreateUserAccountDto): Promise<UserAccount> => {
    const res = await employeeApi.post<BackendResponse<UserAccount>>('/users', data);
    return res.data.data;
  },

  updateUserRole: async (userId: number, role: UserRole): Promise<UserAccount> => {
    const res = await employeeApi.patch<BackendResponse<UserAccount>>(`/users/${userId}/role`, { role });
    return res.data.data;
  },

  updateUserStatus: async (userId: number, isActive: boolean): Promise<UserAccount> => {
    const res = await employeeApi.patch<BackendResponse<UserAccount>>(`/users/${userId}/status`, { isActive });
    return res.data.data;
  },

  updateUserAccess: async (userId: number, payload: { role: UserRole; isActive: boolean }): Promise<UserAccount> => {
    const res = await employeeApi.put<BackendResponse<UserAccount>>(`/users/${userId}/access`, payload);
    return res.data.data;
  },
};
